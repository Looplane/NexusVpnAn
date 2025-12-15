import { Injectable, Logger } from '@nestjs/common';
import { SshService } from '../ssh/ssh.service';

export interface OSInfo {
  type: 'windows' | 'linux' | 'macos' | 'unknown';
  distribution?: string; // 'ubuntu', 'debian', 'centos', 'windows-server-2019', etc.
  version?: string;
  architecture?: string; // 'x64', 'arm64', etc.
}

export interface ServerRequirements {
  ssh: boolean;
  wireguard: boolean;
  firewall: boolean;
  ipForwarding: boolean;
  requiredPorts: number[];
  missingPackages: string[];
  services: {
    wireguard: 'running' | 'stopped' | 'not-installed';
    ssh: 'running' | 'stopped' | 'not-installed';
  };
}

@Injectable()
export class ServerDetectionService {
  private readonly logger = new Logger(ServerDetectionService.name);

  constructor(private readonly sshService: SshService) {}

  /**
   * Detect operating system on remote server
   */
  async detectOS(ipv4: string, sshUser: string = 'root'): Promise<OSInfo> {
    try {
      // Try Windows detection first (PowerShell)
      try {
        const psVersion = await this.sshService.executeCommand(
          'powershell -Command "$PSVersionTable.PSVersion.Major"',
          ipv4,
          sshUser
        );
        if (psVersion && !psVersion.includes('SIMULATION') && !psVersion.includes('mock')) {
          const majorVersion = parseInt(psVersion.trim(), 10);
          if (!isNaN(majorVersion) && majorVersion >= 3) {
            // Get Windows version
            const winVersion = await this.sshService.executeCommand(
              'powershell -Command "(Get-CimInstance Win32_OperatingSystem).Caption"',
              ipv4,
              sshUser
            ).catch(() => 'Windows Server');
            
            return {
              type: 'windows',
              distribution: winVersion.toLowerCase().includes('server') ? 'windows-server' : 'windows',
              version: await this.sshService.executeCommand(
                'powershell -Command "(Get-CimInstance Win32_OperatingSystem).Version"',
                ipv4,
                sshUser
              ).catch(() => 'unknown'),
              architecture: await this.sshService.executeCommand(
                'powershell -Command "$env:PROCESSOR_ARCHITECTURE"',
                ipv4,
                sshUser
              ).catch(() => 'x64')
            };
          }
        }
      } catch (e) {
        // Not Windows, continue to Linux detection
      }

      // Try Linux detection (uname)
      try {
        const uname = await this.sshService.executeCommand('uname -s', ipv4, sshUser);
        if (uname && uname.toLowerCase().includes('linux')) {
          // Get distribution
          let distribution = 'linux';
          let version = 'unknown';

          // Try to detect specific distribution
          try {
            if (await this.sshService.executeCommand('test -f /etc/os-release && echo "yes"', ipv4, sshUser).then(r => r.includes('yes'))) {
              const osRelease = await this.sshService.executeCommand('cat /etc/os-release', ipv4, sshUser);
              const idMatch = osRelease.match(/^ID=(.+)$/m);
              const versionMatch = osRelease.match(/^VERSION_ID="?([^"]+)"?/m);
              
              if (idMatch) {
                distribution = idMatch[1].toLowerCase().replace(/"/g, '');
              }
              if (versionMatch) {
                version = versionMatch[1].replace(/"/g, '');
              }
            }
          } catch (e) {
            // Fallback to lsb_release or other methods
            try {
              const lsb = await this.sshService.executeCommand('lsb_release -is 2>/dev/null || echo "unknown"', ipv4, sshUser);
              if (lsb && !lsb.includes('unknown')) {
                distribution = lsb.toLowerCase().trim();
              }
            } catch (e2) {
              // Use default
            }
          }

          const arch = await this.sshService.executeCommand('uname -m', ipv4, sshUser).catch(() => 'x64');

          return {
            type: 'linux',
            distribution,
            version,
            architecture: arch.trim()
          };
        }

        // Check for macOS
        if (uname && uname.toLowerCase().includes('darwin')) {
          const version = await this.sshService.executeCommand('sw_vers -productVersion', ipv4, sshUser).catch(() => 'unknown');
          return {
            type: 'macos',
            distribution: 'macos',
            version,
            architecture: await this.sshService.executeCommand('uname -m', ipv4, sshUser).catch(() => 'x64')
          };
        }
      } catch (e) {
        this.logger.warn(`Could not detect OS via uname: ${e.message}`);
      }

      return { type: 'unknown' };
    } catch (e) {
      this.logger.error(`Failed to detect OS on ${ipv4}: ${e.message}`);
      return { type: 'unknown' };
    }
  }

  /**
   * Check server requirements for NexusVPN
   */
  async checkRequirements(ipv4: string, sshUser: string = 'root', osInfo?: OSInfo): Promise<ServerRequirements> {
    if (!osInfo) {
      osInfo = await this.detectOS(ipv4, sshUser);
    }

    const requirements: ServerRequirements = {
      ssh: false,
      wireguard: false,
      firewall: false,
      ipForwarding: false,
      requiredPorts: [22, 51820],
      missingPackages: [],
      services: {
        wireguard: 'not-installed',
        ssh: 'not-installed'
      }
    };

    try {
      if (osInfo.type === 'windows') {
        // Windows checks
        // Check SSH
        try {
          const sshStatus = await this.sshService.executeCommand(
            'powershell -Command "Get-Service sshd -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Status"',
            ipv4,
            sshUser
          );
          requirements.ssh = sshStatus && sshStatus.toLowerCase().includes('running');
          requirements.services.ssh = requirements.ssh ? 'running' : 'stopped';
        } catch (e) {
          requirements.services.ssh = 'not-installed';
        }

        // Check WireGuard
        try {
          const wgCheck = await this.sshService.executeCommand(
            'powershell -Command "Get-Service -Name "WireGuardTunnel*" -ErrorAction SilentlyContinue | Select-Object -First 1"',
            ipv4,
            sshUser
          );
          if (wgCheck && wgCheck.trim().length > 0) {
            const wgStatus = await this.sshService.executeCommand(
              'powershell -Command "Get-Service -Name "WireGuardTunnel*" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Status"',
              ipv4,
              sshUser
            );
            requirements.wireguard = wgStatus && wgStatus.toLowerCase().includes('running');
            requirements.services.wireguard = requirements.wireguard ? 'running' : 'stopped';
          } else {
            // Check if wg.exe exists
            const wgExe = await this.sshService.executeCommand(
              'powershell -Command "Test-Path \"C:\\Program Files\\WireGuard\\wg.exe\""',
              ipv4,
              sshUser
            );
            if (wgExe && wgExe.trim().toLowerCase() === 'true') {
              requirements.services.wireguard = 'stopped';
            }
          }
        } catch (e) {
          // WireGuard not installed
        }

        // Check firewall (Windows Firewall)
        try {
          const fwStatus = await this.sshService.executeCommand(
            'powershell -Command "(Get-NetFirewallProfile -Profile Domain,Public,Private).Enabled"',
            ipv4,
            sshUser
          );
          requirements.firewall = fwStatus && fwStatus.includes('True');
        } catch (e) {
          // Firewall check failed
        }

      } else if (osInfo.type === 'linux') {
        // Linux checks
        // Check SSH
        try {
          const sshStatus = await this.sshService.executeCommand(
            'systemctl is-active sshd 2>/dev/null || systemctl is-active ssh 2>/dev/null || echo "inactive"',
            ipv4,
            sshUser
          );
          requirements.ssh = sshStatus && sshStatus.trim() === 'active';
          requirements.services.ssh = requirements.ssh ? 'running' : (sshStatus.includes('inactive') ? 'stopped' : 'not-installed');
        } catch (e) {
          requirements.services.ssh = 'not-installed';
        }

        // Check WireGuard
        try {
          const wgCheck = await this.sshService.executeCommand(
            'which wg 2>/dev/null && echo "installed" || echo "not-installed"',
            ipv4,
            sshUser
          );
          if (wgCheck && wgCheck.includes('installed')) {
            const wgStatus = await this.sshService.executeCommand(
              'systemctl is-active wg-quick@wg0 2>/dev/null || echo "inactive"',
              ipv4,
              sshUser
            );
            requirements.wireguard = wgStatus && wgStatus.trim() === 'active';
            requirements.services.wireguard = requirements.wireguard ? 'running' : 'stopped';
          } else {
            requirements.services.wireguard = 'not-installed';
          }
        } catch (e) {
          requirements.services.wireguard = 'not-installed';
        }

        // Check firewall (UFW or iptables)
        try {
          const ufwCheck = await this.sshService.executeCommand(
            'which ufw 2>/dev/null && ufw status | head -1 || echo "not-installed"',
            ipv4,
            sshUser
          );
          requirements.firewall = ufwCheck && (ufwCheck.includes('active') || ufwCheck.includes('Status: active'));
        } catch (e) {
          // Check iptables as fallback
          try {
            const iptablesCheck = await this.sshService.executeCommand(
              'iptables -L -n 2>/dev/null | head -5 | wc -l',
              ipv4,
              sshUser
            );
            requirements.firewall = parseInt(iptablesCheck.trim(), 10) > 0;
          } catch (e2) {
            // Firewall check failed
          }
        }

        // Check IP forwarding
        try {
          const ipForward = await this.sshService.executeCommand(
            'sysctl net.ipv4.ip_forward | awk \'{print $3}\'',
            ipv4,
            sshUser
          );
          requirements.ipForwarding = ipForward && ipForward.trim() === '1';
        } catch (e) {
          // IP forwarding check failed
        }

        // Check for missing packages
        if (osInfo.distribution === 'ubuntu' || osInfo.distribution === 'debian') {
          const packages = ['wireguard', 'qrencode', 'iptables'];
          for (const pkg of packages) {
            try {
              const check = await this.sshService.executeCommand(
                `dpkg -l | grep -q "^ii.*${pkg}" && echo "installed" || echo "missing"`,
                ipv4,
                sshUser
              );
              if (check && check.includes('missing')) {
                requirements.missingPackages.push(pkg);
              }
            } catch (e) {
              requirements.missingPackages.push(pkg);
            }
          }
        } else if (osInfo.distribution === 'centos' || osInfo.distribution === 'rhel') {
          const packages = ['wireguard-tools'];
          for (const pkg of packages) {
            try {
              const check = await this.sshService.executeCommand(
                `rpm -q ${pkg} 2>/dev/null && echo "installed" || echo "missing"`,
                ipv4,
                sshUser
              );
              if (check && check.includes('missing')) {
                requirements.missingPackages.push(pkg);
              }
            } catch (e) {
              requirements.missingPackages.push(pkg);
            }
          }
        }
      } else if (osInfo.type === 'macos') {
        // macOS checks (similar to Linux but with Homebrew)
        try {
          const sshStatus = await this.sshService.executeCommand(
            'sudo launchctl list | grep sshd || echo "not-running"',
            ipv4,
            sshUser
          );
          requirements.ssh = !sshStatus.includes('not-running');
          requirements.services.ssh = requirements.ssh ? 'running' : 'stopped';
        } catch (e) {
          requirements.services.ssh = 'not-installed';
        }

        // Check WireGuard (via Homebrew)
        try {
          const wgCheck = await this.sshService.executeCommand(
            'which wg 2>/dev/null && echo "installed" || echo "not-installed"',
            ipv4,
            sshUser
          );
          if (wgCheck && wgCheck.includes('installed')) {
            requirements.services.wireguard = 'stopped'; // macOS WireGuard runs differently
            requirements.wireguard = true;
          }
        } catch (e) {
          requirements.services.wireguard = 'not-installed';
        }
      }

    } catch (e) {
      this.logger.error(`Failed to check requirements on ${ipv4}: ${e.message}`);
    }

    return requirements;
  }
}

