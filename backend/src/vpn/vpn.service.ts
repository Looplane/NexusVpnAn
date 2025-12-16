import { Injectable, Logger, InternalServerErrorException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VpnConfig } from './entities/vpn-config.entity';
import { Server } from '../locations/entities/server.entity';
import { SshService } from '../ssh/ssh.service';
import { LocationsService } from '../locations/locations.service';
import { IpamService } from './ipam.service';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { UsageService } from '../usage/usage.service';
import { UserPlan } from '../users/entities/user.entity';
import { GenerateConfigDto } from './dto/generate-config.dto';
import { AuditLog } from '../audit/entities/audit-log.entity';
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';

@Injectable()
export class VpnService {
  private readonly logger = new Logger(VpnService.name);

  constructor(
    @InjectRepository(VpnConfig)
    private vpnConfigRepository: Repository<VpnConfig>,
    @InjectRepository(Server)
    private serverRepository: Repository<Server>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private sshService: SshService,
    private locationsService: LocationsService,
    private ipamService: IpamService,
    private auditService: AuditService,
    private usersService: UsersService,
    private usageService: UsageService,
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

    // In production, provisioning must succeed
    if (process.env.NODE_ENV === 'production' && process.env.MOCK_SSH !== 'true') {
      try {
        await this.provisionPeerOnServer(publicKey, assignedIp, server.ipv4, server.sshUser);
        this.logger.log(`Successfully provisioned peer on ${server.name} (${server.ipv4})`);
      } catch (error) {
        this.logger.error(`Failed to provision peer on ${server.ipv4}: ${error.message}`);
        // In production, if provisioning fails, we shouldn't return a config that won't work
        throw new InternalServerErrorException(`Failed to provision VPN tunnel on remote node: ${error.message}`);
      }
    } else {
      // In dev/mock mode, try but don't fail
      try {
        await this.provisionPeerOnServer(publicKey, assignedIp, server.ipv4, server.sshUser);
      } catch (error) {
        this.logger.warn(`Provisioning failed (dev mode): ${error.message}`);
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

    // 7. Get server public key for config file
    let serverPublicKey = server.publicKey;
    if (!serverPublicKey || serverPublicKey.includes('PLACEHOLDER') || serverPublicKey.includes('mock')) {
      try {
        serverPublicKey = await this.sshService.executeCommand('cat /etc/wireguard/publickey', server.ipv4, server.sshUser);
        if (serverPublicKey && !serverPublicKey.includes('mock') && serverPublicKey.length > 10) {
          serverPublicKey = serverPublicKey.trim();
          // Update server record
          server.publicKey = serverPublicKey;
          await this.serverRepository.save(server);
        } else {
          throw new Error('Invalid key');
        }
      } catch (e) {
        this.logger.warn(`Could not fetch public key for ${server.name}: ${e.message}`);
        serverPublicKey = 'SERVER_PUBLIC_KEY_PLACEHOLDER_BASE64';
      }
    }

    return this.formatConfigFile(privateKey, assignedIp, server, serverPublicKey, dto.dns, dto.mtu);
  }

  async revokeConfig(userId: string, configId: string) {
    const config = await this.vpnConfigRepository.findOne({ where: { id: configId }, relations: ['server'] });
    if (!config) throw new NotFoundException('Configuration not found');

    if (config.userId !== userId) {
      throw new ForbiddenException('You do not own this device');
    }

    const server = await this.locationsService.findOne(config.locationId);

    if (server && process.env.MOCK_SSH !== 'true') {
      try {
        const command = `sudo wg set wg0 peer ${config.publicKey} remove`;
        await this.sshService.executeCommand(command, server.ipv4, server.sshUser);
        this.logger.log(`Removed peer ${config.publicKey.substring(0, 8)}... from ${server.name}`);
      } catch (e) {
        this.logger.warn(`Failed to remove peer from WG server ${server.ipv4}: ${e.message}`);
        // Continue with DB removal even if SSH fails
      }
    }

    await this.vpnConfigRepository.remove(config);

    // LOG
    await this.auditService.log('VPN_KEY_REVOKED', userId, configId, 'User revoked device');
  }

  private async provisionPeerOnServer(publicKey: string, allowedIp: string, host: string, user: string) {
    const interfaceName = 'wg0';
    // Remove /32 suffix if present for WireGuard command
    const cleanIp = allowedIp.replace('/32', '');
    const command = `sudo wg set ${interfaceName} peer ${publicKey} allowed-ips ${cleanIp}/32`;
    
    this.logger.debug(`Provisioning peer ${publicKey.substring(0, 8)}... on ${host} with IP ${cleanIp}`);
    const output = await this.sshService.executeCommand(command, host, user);
    
    // Verify peer was added
    const verifyCommand = `sudo wg show ${interfaceName} dump | grep ${publicKey}`;
    try {
      const verify = await this.sshService.executeCommand(verifyCommand, host, user);
      if (!verify || verify.includes('mock') || verify.includes('SIMULATION')) {
        throw new Error('Peer verification failed');
      }
      this.logger.debug(`Peer verified on ${host}`);
    } catch (e) {
      this.logger.warn(`Could not verify peer on ${host}, but continuing...`);
    }
    
    return output;
  }

  private formatConfigFile(privateKey: string, address: string, server: any, serverPublicKey: string, dns = '1.1.1.1', mtu = 1420): string {
    const endpoint = `${server.ipv4}:${server.wgPort || 51820}`;

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
  async getConnectionLogs(userId: string) {
    // Get VPN-related audit logs for the user
    const logs = await this.auditLogRepository.find({
      where: {
        actorId: userId,
        action: 'VPN_KEY_GENERATED', // We can expand this to include other VPN actions
      },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    // Transform audit logs to connection log format
    const connectionLogs = await Promise.all(
      logs.map(async (log) => {
        // Try to find the server from the config
        const config = await this.vpnConfigRepository.findOne({
          where: { id: log.targetId || '' },
        });
        
        if (!config) {
          // Return a basic log entry
          return {
            id: log.id,
            serverId: '',
            serverCity: 'Unknown',
            connectedAt: log.createdAt.toISOString(),
            dataTransferred: '0',
            device: log.details || 'Unknown',
          };
        }

        const server = await this.serverRepository.findOne({
          where: { id: config.locationId },
        });

        // Get usage data for this config if available
        let dataTransferred = '0';
        try {
          const usageRecords = await this.usageService.getUserUsage(userId);
          const configUsage = usageRecords.find(r => r.userId === userId);
          if (configUsage) {
            const totalBytes = BigInt(configUsage.bytesUploaded) + BigInt(configUsage.bytesDownloaded);
            dataTransferred = totalBytes.toString();
          }
        } catch (e) {
          // Usage data not available, use default
        }

        return {
          id: log.id,
          serverId: server?.id || '',
          serverCity: server?.city || 'Unknown',
          connectedAt: log.createdAt.toISOString(),
          dataTransferred: dataTransferred,
          device: config.name,
        };
      })
    );

    return connectionLogs;
  }

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
