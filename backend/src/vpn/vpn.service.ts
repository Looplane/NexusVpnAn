import { Injectable, Logger, InternalServerErrorException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VpnConfig } from './entities/vpn-config.entity';
import { SshService } from '../ssh/ssh.service';
import { LocationsService } from '../locations/locations.service';
import { IpamService } from './ipam.service';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { UserPlan } from '../users/entities/user.entity';
import { GenerateConfigDto } from './dto/generate-config.dto';
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';

@Injectable()
export class VpnService {
  private readonly logger = new Logger(VpnService.name);

  constructor(
    @InjectRepository(VpnConfig)
    private vpnConfigRepository: Repository<VpnConfig>,
    private sshService: SshService,
    private locationsService: LocationsService,
    private ipamService: IpamService,
    private auditService: AuditService,
    private usersService: UsersService,
  ) { }

  async getUserConfigs(userId: string) {
    return this.vpnConfigRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async generateConfig(userId: string, dto: GenerateConfigDto) {
    this.logger.log(`Generating VPN config for user ${userId} in ${dto.locationId}`);

    // 1. Check Maintenance Mode
    const maintenance = await this.auditService.getSettingValue('maintenance_mode');
    if (maintenance === 'true') {
      throw new ForbiddenException('System is in maintenance mode. Cannot generate new keys.');
    }

    // 2. Check Device Limits
    const user = await this.usersService.findOneById(userId);
    const existingConfigs = await this.vpnConfigRepository.count({ where: { userId } });

    let limit = 1; // Default Free
    if (user.plan === UserPlan.BASIC) limit = 5;
    if (user.plan === UserPlan.PRO) limit = 10;

    if (existingConfigs >= limit) {
      throw new BadRequestException(`Device limit reached for ${user.plan} plan (${limit} devices). Please upgrade.`);
    }

    // 3. Get Server
    const server = await this.locationsService.findOne(dto.locationId);
    if (!server) throw new NotFoundException('Server location not found');

    // 4. Provision
    const { privateKey, publicKey } = this.generateKeypair();
    const assignedIp = await this.ipamService.assignIp(server.id, userId);

    try {
      await this.provisionPeerOnServer(publicKey, assignedIp, server.ipv4, server.sshUser);
    } catch (error) {
      this.logger.error(`Failed to provision peer on ${server.ipv4}: ${error.message}`);
      if (process.env.NODE_ENV === 'production') {
        // In prod, if provisioning fails, we shouldn't return a config that won't work
        throw new InternalServerErrorException('Failed to provision VPN tunnel on remote node');
      }
    }

    // 5. Save Record
    const configEntity = this.vpnConfigRepository.create({
      name: `Device-${server.countryCode}-${Date.now().toString().slice(-4)}`,
      locationId: server.id,
      publicKey,
      assignedIp,
      userId,
    });
    await this.vpnConfigRepository.save(configEntity);

    // 6. Audit
    await this.auditService.log('VPN_KEY_GENERATED', userId, configEntity.id, `Location: ${server.city} (${server.ipv4})`);

    return this.formatConfigFile(privateKey, assignedIp, server, dto.dns, dto.mtu);
  }

  async revokeConfig(userId: string, configId: string) {
    const config = await this.vpnConfigRepository.findOne({ where: { id: configId }, relations: ['server'] }); // IMPORTANT: Join server to get IP
    if (!config) throw new NotFoundException('Configuration not found');

    if (config.userId !== userId) {
      throw new ForbiddenException('You do not own this device');
    }

    // Note: VpnConfig entity needs 'server' relation or we fetch manually
    // Assuming for now we fetch server via locationId
    const server = await this.locationsService.findOne(config.locationId);

    if (server) {
      try {
        const command = `sudo wg set wg0 peer ${config.publicKey} remove`;
        await this.sshService.executeCommand(command, server.ipv4, server.sshUser);
      } catch (e) {
        this.logger.warn(`Failed to remove peer from WG server ${server.ipv4}: ${e.message}`);
      }
    }

    await this.vpnConfigRepository.remove(config);

    // LOG
    await this.auditService.log('VPN_KEY_REVOKED', userId, configId, 'User revoked device');
  }

  private async provisionPeerOnServer(publicKey: string, allowedIp: string, host: string, user: string) {
    const interfaceName = 'wg0';
    const command = `sudo wg set ${interfaceName} peer ${publicKey} allowed-ips ${allowedIp}`;
    const output = await this.sshService.executeCommand(command, host, user);
    return output;
  }

  private formatConfigFile(privateKey: string, address: string, server: any, dns = '1.1.1.1', mtu = 1420): string {
    const endpoint = `${server.ipv4}:${server.wgPort}`;
    const serverPublicKey = server.publicKey || 'SERVER_PUBLIC_KEY_PLACEHOLDER_BASE64';

    return `[Interface]
PrivateKey = ${privateKey}
Address = ${address}
DNS = ${dns}
MTU = ${mtu}

[Peer]
PublicKey = ${serverPublicKey}
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = ${endpoint}
PersistentKeepalive = 25`;
  }

  /**
   * Generate a valid WireGuard keypair using Curve25519.
   * WireGuard uses X25519 (Curve25519 for ECDH).
   * Private key: 32 random bytes, base64-encoded.
   * Public key: Derived from private key via scalar multiplication, base64-encoded.
   */
  private generateKeypair() {
    // Generate a Curve25519 keypair
    const keypair = nacl.box.keyPair();

    // WireGuard expects base64-encoded keys
    const privateKey = naclUtil.encodeBase64(keypair.secretKey);
    const publicKey = naclUtil.encodeBase64(keypair.publicKey);

    this.logger.debug(`Generated WireGuard keypair: Public=${publicKey.substring(0, 8)}...`);

    return { privateKey, publicKey };
  }
}