import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { VpnConfig } from '../vpn/entities/vpn-config.entity';
import { Server } from '../locations/entities/server.entity';
import { AuditService } from '../audit/audit.service';
import { SshService } from '../ssh/ssh.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(VpnConfig) private configRepo: Repository<VpnConfig>,
    @InjectRepository(Server) private serverRepo: Repository<Server>,
    private auditService: AuditService,
    private sshService: SshService,
  ) {}

  async getStats() {
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { isActive: true } });
    const totalTunnels = await this.configRepo.count();
    const servers = await this.serverRepo.find();

    const serverStats = servers.map(s => ({
        id: s.id,
        name: s.name,
        city: s.city,
        country: s.country,
        countryCode: s.countryCode,
        ipv4: s.ipv4,
        load: s.currentLoad,
        status: s.isActive ? 'Online' : 'Offline',
        hasKey: !!s.publicKey
    }));

    return {
      users: { total: totalUsers, active: activeUsers },
      tunnels: { total: totalTunnels },
      servers: serverStats,
    };
  }

  async addServer(data: Partial<Server>, adminId: string) {
      // 1. Save initial record
      const server = this.serverRepo.create(data);
      const saved = await this.serverRepo.save(server);
      await this.auditService.log('SERVER_ADDED', adminId, saved.id, `Added server ${saved.name}`);

      // 2. Attempt to fetch WireGuard Public Key via SSH
      if (process.env.MOCK_SSH !== 'true') {
          try {
              this.logger.log(`Attempting to fetch public key for ${saved.name} (${saved.ipv4})...`);
              
              const pubKey = await this.sshService.executeCommand(
                  'cat /etc/wireguard/publickey', 
                  saved.ipv4, 
                  saved.sshUser
              );
              
              if (pubKey && !pubKey.includes('mock') && !pubKey.includes('SIMULATION') && pubKey.length > 10) {
                  saved.publicKey = pubKey.trim();
                  await this.serverRepo.save(saved);
                  this.logger.log(`Successfully fetched public key for ${saved.name}`);
              } else {
                  this.logger.warn(`Invalid public key received for ${saved.name}`);
              }
          } catch (e) {
              this.logger.warn(`Could not fetch public key for server ${saved.name}: ${e.message}`);
              // We don't fail the request, just log it. Key can be added manually later.
          }
      } else {
          this.logger.debug(`Skipping public key fetch for ${saved.name} (MOCK_SSH=true)`);
      }

      return saved;
  }

  async removeServer(id: string, adminId: string) {
      const server = await this.serverRepo.findOne({ where: { id } });
      if(server) {
         await this.serverRepo.delete(id);
         await this.auditService.log('SERVER_REMOVED', adminId, id, `Removed server ${server.name}`);
      }
      return { success: true };
  }

  // --- Node Provisioning ---

  async generateSetupScript(serverId: string) {
      const server = await this.serverRepo.findOne({ where: { id: serverId } });
      if (!server) throw new NotFoundException('Server not found');

      const backendPubKey = this.sshService.getPublicKey();
      // const callbackUrl = process.env.API_URL || 'http://YOUR_BACKEND_IP:3000';

      return `#!/bin/bash
# ==========================================
# NexusVPN Node Provisioning Script
# Target: ${server.name} (${server.ipv4})
# ==========================================

set -e

echo ">>> Updating System..."
apt-get update && apt-get upgrade -y

echo ">>> Installing WireGuard & Tools..."
apt-get install -y wireguard ufw qrencode

echo ">>> Configuring Network..."
# Enable IP Forwarding
sysctl -w net.ipv4.ip_forward=1
sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf

echo ">>> Setting up SSH Access for Backend..."
mkdir -p /root/.ssh
chmod 700 /root/.ssh
touch /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# Add Backend Public Key if not present
grep -qxF "${backendPubKey}" /root/.ssh/authorized_keys || echo "${backendPubKey}" >> /root/.ssh/authorized_keys

echo ">>> Configuring Firewall (UFW)..."
ufw allow 22/tcp
ufw allow ${server.wgPort}/udp
ufw --force enable

echo ">>> Generating WireGuard Keys..."
umask 077
wg genkey | tee /etc/wireguard/privatekey | wg pubkey > /etc/wireguard/publickey

echo ">>> Creating Initial wg0.conf..."
cat <<EOF > /etc/wireguard/wg0.conf
[Interface]
PrivateKey = \$(cat /etc/wireguard/privatekey)
ListenPort = ${server.wgPort}
SaveConfig = false
PostUp = ufw route allow in on wg0 out on eth0
PostUp = iptables -t nat -I POSTROUTING -o eth0 -j MASQUERADE
PreDown = ufw route delete allow in on wg0 out on eth0
PreDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF

echo ">>> Starting WireGuard..."
systemctl enable wg-quick@wg0
systemctl restart wg-quick@wg0

echo ">>> DONE! Node is ready."
echo "---------------------------------------------------"
echo "Public Key: \$(cat /etc/wireguard/publickey)"
echo "---------------------------------------------------"
`;
  }

  // --- Remote Command Execution ---

  async executeServerCommand(serverId: string, command: string) {
      const server = await this.serverRepo.findOne({ where: { id: serverId } });
      if (!server) throw new NotFoundException('Server not found');

      // Security: Allowlist commands
      const allowed = ['uptime', 'free -m', 'df -h', 'wg show', 'wg show wg0', 'whoami', 'ip addr', 'uname -a'];
      const isAllowed = allowed.some(c => command === c || command.startsWith('wg show wg0'));
      
      if (!isAllowed) {
          throw new BadRequestException('Command not allowed for security reasons.');
      }

      try {
          return await this.sshService.executeCommand(command, server.ipv4, server.sshUser);
      } catch (e) {
          this.logger.error(`Command failed: ${e.message}`);
          throw new BadRequestException(`Execution failed: ${e.message}`);
      }
  }

  // --- User Management ---

  async getAllUsers() {
    return this.userRepo.find({
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'fullName', 'plan', 'role', 'isActive', 'createdAt'] 
    });
  }

  async updateUser(id: string, updates: Partial<User>, adminId: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    Object.assign(user, updates);
    await this.userRepo.save(user);
    await this.auditService.log('USER_UPDATED', adminId, id, `Updated fields: ${Object.keys(updates).join(', ')}`);
    return user;
  }

  async deleteUser(id: string, adminId: string) {
    await this.userRepo.delete(id);
    await this.auditService.log('USER_DELETED', adminId, id, 'User deleted by admin');
    return { success: true };
  }

  // --- Audit & Settings Proxy ---

  async getAuditLogs() {
    const logs = await this.auditService.getLogs(50);
    const enriched = [];
    for(const log of logs) {
        const actor = await this.userRepo.findOne({ where: { id: log.actorId }});
        enriched.push({
            ...log,
            actorEmail: actor ? actor.email : 'System/Deleted'
        });
    }
    return enriched;
  }

  async getSettings() {
    return this.auditService.getSettings();
  }

  async updateSetting(key: string, value: string, adminId: string) {
    const setting = await this.auditService.updateSetting(key, value);
    await this.auditService.log('SETTING_CHANGED', adminId, key, `Set to ${value}`);
    return setting;
  }
}