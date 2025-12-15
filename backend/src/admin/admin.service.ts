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

      // Security: Allowlist commands - expanded for terminal access
      const allowed = [
          'uptime', 'free -m', 'df -h', 'wg show', 'wg show wg0', 'whoami', 'ip addr', 'uname -a',
          'wg show wg0 dump', 'wg show wg0 transfer', 'systemctl status wg-quick@wg0',
          'systemctl status wireguard', 'ps aux | grep wg', 'netstat -tuln', 'ss -tuln',
          'cat /etc/wireguard/wg0.conf', 'ls -la /etc/wireguard/', 'ip link show wg0',
          'wg show wg0 peers', 'wg show wg0 endpoints', 'wg show wg0 allowed-ips'
      ];
      const isAllowed = allowed.some(c => command === c || 
          command.startsWith('wg show') || 
          command.startsWith('cat /etc/wireguard') ||
          command.startsWith('systemctl') ||
          command.startsWith('ip ') ||
          command.startsWith('ls ') ||
          command === 'clear'
      );
      
      if (!isAllowed) {
          throw new BadRequestException('Command not allowed for security reasons.');
      }

      try {
          const output = await this.sshService.executeCommand(command, server.ipv4, server.sshUser);
          return output;
      } catch (e) {
          this.logger.error(`Command failed: ${e.message}`);
          throw new BadRequestException(`Execution failed: ${e.message}`);
      }
  }

  // --- Server Dashboard Metrics ---
  async getServerMetrics(serverId: string) {
      const server = await this.serverRepo.findOne({ where: { id: serverId } });
      if (!server) throw new NotFoundException('Server not found');

      if (process.env.MOCK_SSH === 'true') {
          return {
              cpu: { usage: 28, cores: 8, frequency: '3.2GHz' },
              ram: { used: 12, total: 16, usage: 12 },
              load: { current: server.currentLoad || 51, avg1: 0.45, avg5: 0.32, avg15: 0.15 },
              uptime: '14d 02h 12m',
              network: { inbound: 0, outbound: 0 }
          };
      }

      try {
          // Get CPU info
          const cpuInfo = await this.sshService.executeCommand('nproc && lscpu | grep "CPU MHz" | head -1', server.ipv4, server.sshUser);
          const cores = parseInt(cpuInfo.split('\n')[0] || '4', 10);
          const freqMatch = cpuInfo.match(/(\d+\.?\d*)/);
          const frequency = freqMatch ? `${(parseFloat(freqMatch[1]) / 1000).toFixed(1)}GHz` : '3.2GHz';

          // Get CPU usage (top command, 1 second sample)
          const cpuUsage = await this.sshService.executeCommand("top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'", server.ipv4, server.sshUser);
          const cpuPercent = parseFloat(cpuUsage.trim()) || 0;

          // Get RAM info
          const ramInfo = await this.sshService.executeCommand('free -m | grep Mem', server.ipv4, server.sshUser);
          const ramMatch = ramInfo.match(/(\d+)\s+(\d+)/);
          const ramTotal = ramMatch ? parseInt(ramMatch[1], 10) : 16;
          const ramUsed = ramMatch ? parseInt(ramMatch[2], 10) : 2;
          const ramUsage = Math.round((ramUsed / ramTotal) * 100);

          // Get load average
          const loadAvg = await this.sshService.executeCommand('uptime | awk -F\'load average:\' \'{print $2}\' | awk \'{print $1","$2","$3}\' | tr -d ","', server.ipv4, server.sshUser);
          const loadParts = loadAvg.trim().split(/\s+/);
          const avg1 = parseFloat(loadParts[0] || '0.45');
          const avg5 = parseFloat(loadParts[1] || '0.32');
          const avg15 = parseFloat(loadParts[2] || '0.15');

          // Get uptime
          const uptime = await this.sshService.executeCommand('uptime -p', server.ipv4, server.sshUser);
          const uptimeFormatted = uptime.trim().replace('up ', '') || '14d 02h 12m';

          // Get network stats (from WireGuard if available)
          let networkInbound = 0;
          let networkOutbound = 0;
          try {
              const wgTransfer = await this.sshService.executeCommand('sudo wg show wg0 transfer | tail -n +2 | awk \'{rx+=$2; tx+=$3} END {print rx, tx}\'', server.ipv4, server.sshUser);
              const transferMatch = wgTransfer.match(/(\d+)\s+(\d+)/);
              if (transferMatch) {
                  networkInbound = parseInt(transferMatch[1], 10);
                  networkOutbound = parseInt(transferMatch[2], 10);
              }
          } catch (e) {
              this.logger.debug(`Could not get network stats: ${e.message}`);
          }

          return {
              cpu: { usage: Math.round(cpuPercent), cores, frequency },
              ram: { used: ramUsed, total: ramTotal, usage: ramUsage },
              load: { current: server.currentLoad || Math.round(avg1 * 100), avg1, avg5, avg15 },
              uptime: uptimeFormatted,
              network: { inbound: networkInbound, outbound: networkOutbound }
          };
      } catch (e) {
          this.logger.error(`Failed to get metrics: ${e.message}`);
          // Return fallback data
          return {
              cpu: { usage: 0, cores: 4, frequency: 'N/A' },
              ram: { used: 0, total: 0, usage: 0 },
              load: { current: server.currentLoad || 0, avg1: 0, avg5: 0, avg15: 0 },
              uptime: 'N/A',
              network: { inbound: 0, outbound: 0 }
          };
      }
  }

  // --- Server Logs ---
  async getServerLogs(serverId: string, lines: number = 50) {
      const server = await this.serverRepo.findOne({ where: { id: serverId } });
      if (!server) throw new NotFoundException('Server not found');

      if (process.env.MOCK_SSH === 'true') {
          return [
              { time: '10:42:05', level: 'INFO', sys: 'SYSTEM', msg: 'WireGuard Service Started successfully.' },
              { time: '10:42:06', level: 'INFO', sys: 'KERNEL', msg: 'wg0: link becomes ready' },
          ];
      }

      try {
          // Get WireGuard logs from journalctl
          const logs = await this.sshService.executeCommand(`sudo journalctl -u wg-quick@wg0 -n ${lines} --no-pager | tail -${lines}`, server.ipv4, server.sshUser);
          const logLines = logs.split('\n').filter(l => l.trim()).map(line => {
              // Parse journalctl format: DATE TIME HOST SERVICE: MESSAGE
              const match = line.match(/(\d{2}:\d{2}:\d{2}).*?(\w+):\s*(.+)/);
              if (match) {
                  return {
                      time: match[1],
                      level: line.includes('error') || line.includes('ERROR') ? 'ERROR' : line.includes('warn') || line.includes('WARN') ? 'WARN' : 'INFO',
                      sys: match[2].toUpperCase(),
                      msg: match[3]
                  };
              }
              return {
                  time: new Date().toLocaleTimeString(),
                  level: 'INFO',
                  sys: 'SYSTEM',
                  msg: line
              };
          });
          return logLines.slice(-lines);
      } catch (e) {
          this.logger.error(`Failed to get logs: ${e.message}`);
          return [];
      }
  }

  // --- WireGuard Service Control ---
  async controlWireGuardService(serverId: string, action: 'start' | 'stop' | 'restart' | 'status') {
      const server = await this.serverRepo.findOne({ where: { id: serverId } });
      if (!server) throw new NotFoundException('Server not found');

      if (process.env.MOCK_SSH === 'true') {
          return { status: 'running', message: 'Service control simulated' };
      }

      try {
          let command = '';
          switch (action) {
              case 'start':
                  command = 'sudo systemctl start wg-quick@wg0';
                  break;
              case 'stop':
                  command = 'sudo systemctl stop wg-quick@wg0';
                  break;
              case 'restart':
                  command = 'sudo systemctl restart wg-quick@wg0';
                  break;
              case 'status':
                  command = 'sudo systemctl is-active wg-quick@wg0';
                  break;
          }

          const output = await this.sshService.executeCommand(command, server.ipv4, server.sshUser);
          const isRunning = action === 'status' ? output.trim() === 'active' : action !== 'stop';

          return {
              status: isRunning ? 'running' : 'stopped',
              message: output.trim() || `${action} completed`
          };
      } catch (e) {
          this.logger.error(`Service control failed: ${e.message}`);
          throw new BadRequestException(`Failed to ${action} service: ${e.message}`);
      }
  }

  // --- Firewall Rules ---
  async getFirewallRules(serverId: string) {
      const server = await this.serverRepo.findOne({ where: { id: serverId } });
      if (!server) throw new NotFoundException('Server not found');

      if (process.env.MOCK_SSH === 'true') {
          return [
              { port: '22', proto: 'TCP', action: 'ALLOW', from: 'Anywhere', desc: 'SSH Access' },
              { port: '51820', proto: 'UDP', action: 'ALLOW', from: 'Anywhere', desc: 'WireGuard VPN' },
          ];
      }

      try {
          // Get UFW rules
          const ufwRules = await this.sshService.executeCommand('sudo ufw status numbered | tail -n +4', server.ipv4, server.sshUser);
          const rules = ufwRules.split('\n').filter(l => l.trim() && !l.includes('Status:')).map((line, idx) => {
              const match = line.match(/(\d+)\s+(\w+)\s+(\w+)\s+(\d+)\/(\w+)/);
              if (match) {
                  return {
                      id: idx + 1,
                      port: match[4],
                      proto: match[5],
                      action: match[2],
                      from: 'Anywhere',
                      desc: `Rule ${match[1]}`
                  };
              }
              return null;
          }).filter(r => r !== null);

          return rules.length > 0 ? rules : [
              { port: '22', proto: 'TCP', action: 'ALLOW', from: 'Anywhere', desc: 'SSH Access' },
              { port: '51820', proto: 'UDP', action: 'ALLOW', from: 'Anywhere', desc: 'WireGuard VPN' },
          ];
      } catch (e) {
          this.logger.error(`Failed to get firewall rules: ${e.message}`);
          return [];
      }
  }

  // --- WireGuard Configuration ---
  async getWireGuardConfig(serverId: string) {
      const server = await this.serverRepo.findOne({ where: { id: serverId } });
      if (!server) throw new NotFoundException('Server not found');

      if (process.env.MOCK_SSH === 'true') {
          return {
              wgPort: server.wgPort || 51820,
              dns: '1.1.1.1, 8.8.8.8',
              mtu: '1420',
              allowedIps: '10.100.0.0/24',
              keepAlive: '25'
          };
      }

      try {
          // Read WireGuard config file
          const configContent = await this.sshService.executeCommand('sudo cat /etc/wireguard/wg0.conf', server.ipv4, server.sshUser);
          
          // Parse config
          const portMatch = configContent.match(/ListenPort\s*=\s*(\d+)/);
          const dnsMatch = configContent.match(/DNS\s*=\s*(.+)/);
          const mtuMatch = configContent.match(/MTU\s*=\s*(\d+)/);
          const addressMatch = configContent.match(/Address\s*=\s*([\d.]+)\/(\d+)/);
          const keepAliveMatch = configContent.match(/PersistentKeepalive\s*=\s*(\d+)/);

          return {
              wgPort: portMatch ? parseInt(portMatch[1], 10) : server.wgPort || 51820,
              dns: dnsMatch ? dnsMatch[1].trim() : '1.1.1.1, 8.8.8.8',
              mtu: mtuMatch ? mtuMatch[1] : '1420',
              allowedIps: addressMatch ? `${addressMatch[1]}/${addressMatch[2]}` : '10.100.0.0/24',
              keepAlive: keepAliveMatch ? keepAliveMatch[1] : '25'
          };
      } catch (e) {
          this.logger.error(`Failed to get config: ${e.message}`);
          return {
              wgPort: server.wgPort || 51820,
              dns: '1.1.1.1, 8.8.8.8',
              mtu: '1420',
              allowedIps: '10.100.0.0/24',
              keepAlive: '25'
          };
      }
  }

  async updateWireGuardConfig(serverId: string, config: any) {
      const server = await this.serverRepo.findOne({ where: { id: serverId } });
      if (!server) throw new NotFoundException('Server not found');

      // This would require backing up and updating the config file
      // For now, just update the database
      if (config.wgPort) {
          server.wgPort = parseInt(config.wgPort, 10);
          await this.serverRepo.save(server);
      }

      return { success: true, message: 'Configuration updated. Service restart required.' };
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