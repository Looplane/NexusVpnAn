import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from '../locations/entities/server.entity';
import { SshService } from '../ssh/ssh.service';
import { ServerDetectionService, OSInfo, ServerRequirements } from './server-detection.service';

@Injectable()
export class AutoConfigService {
  private readonly logger = new Logger(AutoConfigService.name);

  constructor(
    @InjectRepository(Server) private serverRepo: Repository<Server>,
    private sshService: SshService,
    private detectionService: ServerDetectionService,
  ) {}

  /**
   * Auto-configure a remote VPN server
   */
  async autoConfigureServer(
    ipv4: string,
    sshUser: string = 'root',
    serverData: Partial<Server>,
    password?: string
  ): Promise<{ success: boolean; server: Server; osInfo: OSInfo; requirements: ServerRequirements; steps: string[] }> {
    const steps: string[] = [];
    
    try {
      // Step 1: Detect OS
      steps.push('Detecting operating system...');
      this.logger.log(`Detecting OS on ${ipv4}...`);
      const osInfo = await this.detectionService.detectOS(ipv4, sshUser, password);
      steps.push(`Detected: ${osInfo.type} ${osInfo.distribution || ''} ${osInfo.version || ''}`);

      if (osInfo.type === 'unknown') {
        throw new BadRequestException('Could not detect operating system. Please ensure SSH access is configured.');
      }

      // Step 2: Check requirements
      steps.push('Checking server requirements...');
      const requirements = await this.detectionService.checkRequirements(ipv4, sshUser, osInfo, password);
      steps.push(`Requirements check complete. Missing: ${requirements.missingPackages.length} packages`);

      // Step 3: Install missing requirements
      if (requirements.missingPackages.length > 0 || requirements.services.wireguard === 'not-installed') {
        steps.push('Installing missing requirements...');
        await this.installRequirements(ipv4, sshUser, osInfo, requirements, password);
        steps.push('Requirements installed successfully');
      }

      // Step 4: Configure SSH access (if needed)
      if (!requirements.ssh || requirements.services.ssh !== 'running') {
        steps.push('Configuring SSH access...');
        await this.configureSSH(ipv4, sshUser, osInfo, password);
        steps.push('SSH configured');
      }

      // Step 5: Configure WireGuard
      if (requirements.services.wireguard === 'not-installed' || requirements.services.wireguard === 'stopped') {
        steps.push('Configuring WireGuard...');
        await this.configureWireGuard(ipv4, sshUser, osInfo, serverData.wgPort || 51820, password);
        steps.push('WireGuard configured');
      }

      // Step 6: Configure firewall
      if (!requirements.firewall) {
        steps.push('Configuring firewall...');
        await this.configureFirewall(ipv4, sshUser, osInfo, serverData.wgPort || 51820, password);
        steps.push('Firewall configured');
      }

      // Step 7: Enable IP forwarding (Linux only)
      if (osInfo.type === 'linux' && !requirements.ipForwarding) {
        steps.push('Enabling IP forwarding...');
        await this.enableIPForwarding(ipv4, sshUser, password);
        steps.push('IP forwarding enabled');
      }

      // Step 8: Get WireGuard public key
      steps.push('Fetching WireGuard public key...');
      const publicKey = await this.getWireGuardPublicKey(ipv4, sshUser, osInfo, password);
      steps.push('Public key retrieved');

      // Step 9: Create server record
      steps.push('Creating server record...');
      const server = this.serverRepo.create({
        ...serverData,
        ipv4,
        sshUser,
        publicKey,
        isActive: true,
        wgPort: serverData.wgPort || 51820,
      });
      const saved = await this.serverRepo.save(server);
      steps.push('Server added successfully');

      return {
        success: true,
        server: saved,
        osInfo,
        requirements: await this.detectionService.checkRequirements(ipv4, sshUser, osInfo),
        steps
      };

    } catch (e) {
      this.logger.error(`Auto-configuration failed for ${ipv4}: ${e.message}`);
      throw new InternalServerErrorException(`Auto-configuration failed: ${e.message}`);
    }
  }

  /**
   * Install missing requirements based on OS
   */
  private async installRequirements(
    ipv4: string,
    sshUser: string,
    osInfo: OSInfo,
    requirements: ServerRequirements,
    password?: string
  ): Promise<void> {
    if (osInfo.type === 'windows') {
      // Windows: Install WireGuard
      if (requirements.services.wireguard === 'not-installed') {
        // Download and install WireGuard for Windows
        const installCmd = `powershell -Command "Invoke-WebRequest -Uri 'https://download.wireguard.com/windows-client/wireguard-installer.exe' -OutFile '$env:TEMP\\wireguard-installer.exe'; Start-Process -FilePath '$env:TEMP\\wireguard-installer.exe' -ArgumentList '/S' -Wait"`;
        await this.sshService.executeCommand(installCmd, ipv4, sshUser, 3, password);
      }
    } else if (osInfo.type === 'linux') {
      // Linux: Install packages based on distribution
      if (osInfo.distribution === 'ubuntu' || osInfo.distribution === 'debian') {
        await this.sshService.executeCommand('apt-get update -y', ipv4, sshUser, 3, password);
        if (requirements.missingPackages.length > 0) {
          await this.sshService.executeCommand(
            `apt-get install -y ${requirements.missingPackages.join(' ')}`,
            ipv4,
            sshUser
          );
        }
        // Install WireGuard if not installed
        if (requirements.services.wireguard === 'not-installed') {
          await this.sshService.executeCommand('apt-get install -y wireguard wireguard-tools qrencode', ipv4, sshUser, 3, password);
        }
      } else if (osInfo.distribution === 'centos' || osInfo.distribution === 'rhel' || osInfo.distribution === 'fedora') {
        // Add WireGuard repository for CentOS/RHEL
        await this.sshService.executeCommand(
          'yum install -y epel-release elrepo-release',
          ipv4,
          sshUser,
          3,
          password
        );
        await this.sshService.executeCommand(
          'yum install -y kmod-wireguard wireguard-tools',
          ipv4,
          sshUser,
          3,
          password
        );
      }
    } else if (osInfo.type === 'macos') {
      // macOS: Install via Homebrew
      await this.sshService.executeCommand(
        'brew install wireguard-tools || (brew install wireguard-tools 2>&1)',
        ipv4,
        sshUser,
        3,
        password
      );
    }
  }

  /**
   * Configure SSH access
   */
  private async configureSSH(ipv4: string, sshUser: string, osInfo: OSInfo, password?: string): Promise<void> {
    const backendPubKey = this.sshService.getPublicKey();

    if (osInfo.type === 'windows') {
      // Windows: Configure OpenSSH Server
      await this.sshService.executeCommand(
        'powershell -Command "Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0"',
        ipv4,
        sshUser,
        3,
        password
      );
      await this.sshService.executeCommand(
        'powershell -Command "Start-Service sshd; Set-Service -Name sshd -StartupType Automatic"',
        ipv4,
        sshUser,
        3,
        password
      );
      
      // Add authorized key
      const sshPath = `$env:USERPROFILE\\.ssh`;
      await this.sshService.executeCommand(
        `powershell -Command "New-Item -ItemType Directory -Force -Path '${sshPath}' | Out-Null; Add-Content -Path '${sshPath}\\authorized_keys' -Value '${backendPubKey}'"`,
        ipv4,
        sshUser,
        3,
        password
      );
    } else {
      // Linux/macOS: Standard SSH setup
      await this.sshService.executeCommand(
        `mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo "${backendPubKey}" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`,
        ipv4,
        sshUser,
        3,
        password
      );
    }
  }

  /**
   * Configure WireGuard
   */
  private async configureWireGuard(ipv4: string, sshUser: string, osInfo: OSInfo, wgPort: number, password?: string): Promise<void> {
    if (osInfo.type === 'windows') {
      // Windows: WireGuard is GUI-based, create config file
      const configPath = 'C:\\Program Files\\WireGuard\\Data\\Configurations\\wg0.conf';
      const config = `[Interface]
PrivateKey = (will be generated by WireGuard)
Address = 10.100.0.1/24
ListenPort = ${wgPort}
DNS = 1.1.1.1

[Peer]
# NexusVPN Backend
PublicKey = ${this.sshService.getPublicKey()}
AllowedIPs = 0.0.0.0/0
Endpoint = ${ipv4}:${wgPort}
PersistentKeepalive = 25`;

      await this.sshService.executeCommand(
        `powershell -Command "New-Item -ItemType Directory -Force -Path 'C:\\Program Files\\WireGuard\\Data\\Configurations' | Out-Null; Set-Content -Path '${configPath}' -Value @'\n${config}\n'@'"`,
        ipv4,
        sshUser,
        3,
        password
      );
    } else {
      // Linux/macOS: Standard WireGuard setup
      await this.sshService.executeCommand(
        'mkdir -p /etc/wireguard && chmod 700 /etc/wireguard',
        ipv4,
        sshUser,
        3,
        password
      );

      // Generate keys
      await this.sshService.executeCommand(
        'cd /etc/wireguard && umask 077 && wg genkey | tee privatekey | wg pubkey > publickey',
        ipv4,
        sshUser,
        3,
        password
      );

      // Create config
      const privateKey = await this.sshService.executeCommand('cat /etc/wireguard/privatekey', ipv4, sshUser, 3, password);
      const config = `[Interface]
PrivateKey = ${privateKey.trim()}
Address = 10.100.0.1/24
ListenPort = ${wgPort}
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE`;

      await this.sshService.executeCommand(
        `cat > /etc/wireguard/wg0.conf << 'EOF'\n${config}\nEOF`,
        ipv4,
        sshUser,
        3,
        password
      );

      // Enable and start WireGuard
      await this.sshService.executeCommand(
        'systemctl enable wg-quick@wg0 && systemctl start wg-quick@wg0',
        ipv4,
        sshUser,
        3,
        password
      );
    }
  }

  /**
   * Configure firewall
   */
  private async configureFirewall(ipv4: string, sshUser: string, osInfo: OSInfo, wgPort: number, password?: string): Promise<void> {
    if (osInfo.type === 'windows') {
      // Windows Firewall
        await this.sshService.executeCommand(
          `powershell -Command "New-NetFirewallRule -DisplayName 'WireGuard VPN' -Direction Inbound -Protocol UDP -LocalPort ${wgPort} -Action Allow"`,
          ipv4,
          sshUser,
          3,
          password
        );
        await this.sshService.executeCommand(
          'powershell -Command "New-NetFirewallRule -DisplayName "SSH" -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow"',
          ipv4,
          sshUser,
          3,
          password
        );
    } else {
      // Linux: UFW or iptables
      try {
        await this.sshService.executeCommand(
          `ufw allow ${wgPort}/udp comment 'WireGuard VPN'`,
          ipv4,
          sshUser,
          3,
          password
        );
        await this.sshService.executeCommand(
          'ufw allow 22/tcp comment "SSH"',
          ipv4,
          sshUser,
          3,
          password
        );
        await this.sshService.executeCommand(
          'ufw --force enable',
          ipv4,
          sshUser,
          3,
          password
        );
      } catch (e) {
        // UFW not available, use iptables
        await this.sshService.executeCommand(
          `iptables -A INPUT -p udp --dport ${wgPort} -j ACCEPT`,
          ipv4,
          sshUser,
          3,
          password
        );
        await this.sshService.executeCommand(
          'iptables -A INPUT -p tcp --dport 22 -j ACCEPT',
          ipv4,
          sshUser,
          3,
          password
        );
      }
    }
  }

  /**
   * Enable IP forwarding (Linux only)
   */
  private async enableIPForwarding(ipv4: string, sshUser: string, password?: string): Promise<void> {
    await this.sshService.executeCommand(
      'sysctl -w net.ipv4.ip_forward=1',
      ipv4,
      sshUser,
      3,
      password
    );
    await this.sshService.executeCommand(
      'echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf',
      ipv4,
      sshUser,
      3,
      password
    );
    await this.sshService.executeCommand(
      'sysctl -w net.ipv6.conf.all.forwarding=1',
      ipv4,
      sshUser,
      3,
      password
    );
  }

  /**
   * Get WireGuard public key from server
   */
  private async getWireGuardPublicKey(ipv4: string, sshUser: string, osInfo: OSInfo, password?: string): Promise<string> {
    if (osInfo.type === 'windows') {
      // Windows: Extract from config or use wg.exe
      try {
        const pubKey = await this.sshService.executeCommand(
          'powershell -Command "Get-Content \'C:\\Program Files\\WireGuard\\Data\\Configurations\\wg0.conf\' | Select-String -Pattern \'PublicKey\' | ForEach-Object { $_.Line -replace \'.*PublicKey\\s*=\\s*([^\\s]+).*\', \'$1\' }"',
          ipv4,
          sshUser,
          3,
          password
        );
        if (pubKey && pubKey.trim().length > 10) {
          return pubKey.trim();
        }
      } catch (e) {
        // Try wg.exe
        const wgKey = await this.sshService.executeCommand(
          'wg pubkey < "C:\\Program Files\\WireGuard\\privatekey"',
          ipv4,
          sshUser,
          3,
          password
        ).catch(() => null);
        if (wgKey) return wgKey.trim();
      }
      throw new Error('Could not retrieve WireGuard public key from Windows server');
    } else {
      // Linux/macOS: Read from file
      const pubKey = await this.sshService.executeCommand(
        'cat /etc/wireguard/publickey',
        ipv4,
        sshUser,
        3,
        password
      );
      if (!pubKey || pubKey.includes('SIMULATION') || pubKey.length < 10) {
        throw new Error('Invalid WireGuard public key');
      }
      return pubKey.trim();
    }
  }
}

