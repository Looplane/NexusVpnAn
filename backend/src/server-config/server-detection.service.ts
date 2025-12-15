import { Injectable, Logger } from '@nestjs/common';
import { SshService } from '../ssh/ssh.service';

export interface OSInfo {
  type: 'windows' | 'linux' | 'macos' | 'unknown';
  distribution?: string; // 'ubuntu', 'debian', 'centos', 'windows-server-2019', etc.
  version?: string;
  architecture?: string; // 'x64', 'arm64', etc.
}

export interface ServerFingerprint {
  hostname?: string;
  cpu?: {
    model?: string;
    cores?: number;
    threads?: number;
    frequency?: string;
  };
  memory?: {
    total?: number; // in MB
    available?: number; // in MB
  };
  disk?: {
    total?: number; // in GB
    available?: number; // in GB
  };
  network?: {
    interfaces?: Array<{ name: string; ip: string; mac?: string }>;
    publicIP?: string;
  };
  timezone?: string;
  uptime?: string;
  kernel?: string;
  wireguard?: {
    installed: boolean;
    configPath?: string;
    publicKey?: string;
    listenPort?: number;
    interfaceIP?: string;
  };
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
  async detectOS(ipv4: string, sshUser: string = 'root', password?: string): Promise<OSInfo> {
    try {
      // Try Windows detection first (PowerShell)
      try {
        const psVersion = await this.sshService.executeCommand(
          'powershell -Command "$PSVersionTable.PSVersion.Major"',
          ipv4,
          sshUser,
          3,
          password
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
        const uname = await this.sshService.executeCommand('uname -s', ipv4, sshUser, 3, password);
        if (uname && uname.toLowerCase().includes('linux')) {
          // Get distribution
          let distribution = 'linux';
          let version = 'unknown';

          // Try to detect specific distribution
          try {
            if (await this.sshService.executeCommand('test -f /etc/os-release && echo "yes"', ipv4, sshUser, 3, password).then(r => r.includes('yes'))) {
              const osRelease = await this.sshService.executeCommand('cat /etc/os-release', ipv4, sshUser, 3, password);
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
              const lsb = await this.sshService.executeCommand('lsb_release -is 2>/dev/null || echo "unknown"', ipv4, sshUser, 3, password);
              if (lsb && !lsb.includes('unknown')) {
                distribution = lsb.toLowerCase().trim();
              }
            } catch (e2) {
              // Use default
            }
          }

          const arch = await this.sshService.executeCommand('uname -m', ipv4, sshUser, 3, password).catch(() => 'x64');

          return {
            type: 'linux',
            distribution,
            version,
            architecture: arch.trim()
          };
        }

        // Check for macOS
        if (uname && uname.toLowerCase().includes('darwin')) {
          const version = await this.sshService.executeCommand('sw_vers -productVersion', ipv4, sshUser, 3, password).catch(() => 'unknown');
          return {
            type: 'macos',
            distribution: 'macos',
            version,
            architecture: await this.sshService.executeCommand('uname -m', ipv4, sshUser, 3, password).catch(() => 'x64')
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
  async checkRequirements(ipv4: string, sshUser: string = 'root', osInfo?: OSInfo, password?: string): Promise<ServerRequirements> {
    if (!osInfo) {
      osInfo = await this.detectOS(ipv4, sshUser, password);
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
            sshUser,
            3,
            password
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
            sshUser,
            3,
            password
          );
          if (wgCheck && wgCheck.trim().length > 0) {
            const wgStatus = await this.sshService.executeCommand(
              'powershell -Command "Get-Service -Name "WireGuardTunnel*" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Status"',
              ipv4,
              sshUser,
              3,
              password
            );
            requirements.wireguard = wgStatus && wgStatus.toLowerCase().includes('running');
            requirements.services.wireguard = requirements.wireguard ? 'running' : 'stopped';
          } else {
            // Check if wg.exe exists
            const wgExe = await this.sshService.executeCommand(
              'powershell -Command "Test-Path \"C:\\Program Files\\WireGuard\\wg.exe\""',
              ipv4,
              sshUser,
              3,
              password
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
            sshUser,
            3,
            password
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
            sshUser,
            3,
            password
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
              sshUser,
              3,
              password
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
            sshUser,
            3,
            password
          );
          requirements.firewall = ufwCheck && (ufwCheck.includes('active') || ufwCheck.includes('Status: active'));
        } catch (e) {
          // Check iptables as fallback
          try {
            const iptablesCheck = await this.sshService.executeCommand(
              'iptables -L -n 2>/dev/null | head -5 | wc -l',
              ipv4,
              sshUser,
              3,
              password
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
            sshUser,
            3,
            password
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
                sshUser,
                3,
                password
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
                sshUser,
                3,
                password
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
            sshUser,
            3,
            password
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

  /**
   * Get comprehensive server fingerprint
   */
  async getServerFingerprint(ipv4: string, sshUser: string = 'root', password?: string): Promise<ServerFingerprint> {
    const fingerprint: ServerFingerprint = {};
    const osInfo = await this.detectOS(ipv4, sshUser, password);

    try {
      if (osInfo.type === 'windows') {
        // Windows fingerprint
        try {
          fingerprint.hostname = await this.sshService.executeCommand(
            'powershell -Command "$env:COMPUTERNAME"',
            ipv4, sshUser, 3, password
          ).catch(() => undefined);
        } catch (e) {}

        try {
          const cpuInfo = await this.sshService.executeCommand(
            'powershell -Command "$cpu = Get-WmiObject Win32_Processor; Write-Output \"$($cpu.Name) $($cpu.NumberOfCores) $($cpu.NumberOfLogicalProcessors) $($cpu.MaxClockSpeed)\""',
            ipv4, sshUser, 3, password
          );
          const parts = cpuInfo.trim().split(/\s+/);
          if (parts.length >= 4) {
            fingerprint.cpu = {
              model: parts.slice(0, -3).join(' '),
              cores: parseInt(parts[parts.length - 3] || '4', 10),
              threads: parseInt(parts[parts.length - 2] || '8', 10),
              frequency: `${(parseInt(parts[parts.length - 1] || '3200', 10) / 1000).toFixed(1)}GHz`
            };
          }
        } catch (e) {}

        try {
          const memInfo = await this.sshService.executeCommand(
            'powershell -Command "$mem = Get-WmiObject Win32_ComputerSystem; $total = [math]::Round($mem.TotalPhysicalMemory / 1MB, 0); $free = [math]::Round((Get-WmiObject Win32_OperatingSystem).FreePhysicalMemory / 1MB, 0); Write-Output \"$total $free\""',
            ipv4, sshUser, 3, password
          );
          const parts = memInfo.trim().split(/\s+/);
          if (parts.length >= 2) {
            fingerprint.memory = {
              total: parseInt(parts[0] || '8192', 10),
              available: parseInt(parts[1] || '4096', 10)
            };
          }
        } catch (e) {}

        try {
          fingerprint.timezone = await this.sshService.executeCommand(
            'powershell -Command "[System.TimeZoneInfo]::Local.Id"',
            ipv4, sshUser, 3, password
          ).catch(() => undefined);
        } catch (e) {}

        try {
          const uptime = await this.sshService.executeCommand(
            'powershell -Command "$os = Get-WmiObject Win32_OperatingSystem; $uptime = (Get-Date) - $os.ConvertToDateTime($os.LastBootUpTime); Write-Output \"$($uptime.Days)d $($uptime.Hours)h\""',
            ipv4, sshUser, 3, password
          );
          fingerprint.uptime = uptime.trim();
        } catch (e) {}

        // Check WireGuard - use dynamic path finding
        try {
          const wgPath = await this.findWireGuardConfigPath(ipv4, sshUser, osInfo, password);
          if (wgPath) {
            fingerprint.wireguard = { installed: true, configPath: wgPath };
            try {
              const wgConfig = await this.sshService.executeCommand(
                `powershell -Command "Get-Content '${wgPath}' -ErrorAction SilentlyContinue"`,
                ipv4, sshUser, 3, password
              );
              if (wgConfig && !wgConfig.includes('Cannot find path')) {
                const listenPortMatch = wgConfig.match(/ListenPort\s*=\s*(\d+)/i);
                const addressMatch = wgConfig.match(/Address\s*=\s*([^\s]+)/i);
                if (listenPortMatch) fingerprint.wireguard!.listenPort = parseInt(listenPortMatch[1], 10);
                if (addressMatch) fingerprint.wireguard!.interfaceIP = addressMatch[1];
              }
            } catch (e) {}
          } else {
            // Check if WireGuard service exists even if config not found
            try {
              const wgService = await this.sshService.executeCommand(
                'powershell -Command "Get-Service -Name \"WireGuardTunnel*\" -ErrorAction SilentlyContinue | Select-Object -First 1"',
                ipv4, sshUser, 3, password
              );
              if (wgService && wgService.trim()) {
                fingerprint.wireguard = { installed: true };
              } else {
                fingerprint.wireguard = { installed: false };
              }
            } catch (e) {
              fingerprint.wireguard = { installed: false };
            }
          }
        } catch (e) {
          fingerprint.wireguard = { installed: false };
        }

      } else if (osInfo.type === 'linux') {
        // Linux fingerprint
        try {
          fingerprint.hostname = await this.sshService.executeCommand(
            'hostname',
            ipv4, sshUser, 3, password
          ).catch(() => undefined);
        } catch (e) {}

        try {
          const cpuInfo = await this.sshService.executeCommand(
            'lscpu | grep -E "Model name|CPU\\(s\\)|Thread|MHz" | head -4',
            ipv4, sshUser, 3, password
          );
          const modelMatch = cpuInfo.match(/Model name:\s*(.+)/);
          const coresMatch = cpuInfo.match(/^CPU\\(s\\):\s*(\d+)/m);
          const threadsMatch = cpuInfo.match(/Thread\\(s\\) per core:\s*(\d+)/);
          const freqMatch = cpuInfo.match(/CPU MHz:\s*([\d.]+)/);
          fingerprint.cpu = {
            model: modelMatch ? modelMatch[1].trim() : undefined,
            cores: coresMatch ? parseInt(coresMatch[1], 10) : undefined,
            threads: coresMatch && threadsMatch ? parseInt(coresMatch[1], 10) * parseInt(threadsMatch[1], 10) : undefined,
            frequency: freqMatch ? `${(parseFloat(freqMatch[1]) / 1000).toFixed(1)}GHz` : undefined
          };
        } catch (e) {}

        try {
          const memInfo = await this.sshService.executeCommand(
            'free -m | grep Mem',
            ipv4, sshUser, 3, password
          );
          const match = memInfo.match(/(\d+)\s+(\d+)\s+(\d+)/);
          if (match) {
            fingerprint.memory = {
              total: parseInt(match[1], 10),
              available: parseInt(match[3], 10)
            };
          }
        } catch (e) {}

        try {
          const diskInfo = await this.sshService.executeCommand(
            'df -BG / | tail -1 | awk \'{print $2, $4}\' | sed \'s/G//g\'',
            ipv4, sshUser, 3, password
          );
          const parts = diskInfo.trim().split(/\s+/);
          if (parts.length >= 2) {
            fingerprint.disk = {
              total: parseInt(parts[0] || '20', 10),
              available: parseInt(parts[1] || '10', 10)
            };
          }
        } catch (e) {}

        try {
          fingerprint.timezone = await this.sshService.executeCommand(
            'timedatectl show -p Timezone --value 2>/dev/null || cat /etc/timezone 2>/dev/null || echo "UTC"',
            ipv4, sshUser, 3, password
          ).catch(() => 'UTC');
        } catch (e) {}

        try {
          fingerprint.uptime = await this.sshService.executeCommand(
            'uptime -p',
            ipv4, sshUser, 3, password
          ).catch(() => undefined);
        } catch (e) {}

        try {
          fingerprint.kernel = await this.sshService.executeCommand(
            'uname -r',
            ipv4, sshUser, 3, password
          ).catch(() => undefined);
        } catch (e) {}

        // Network interfaces
        try {
          const interfaces = await this.sshService.executeCommand(
            'ip -4 addr show | grep -E "^[0-9]+:|inet " | grep -v "127.0.0.1" | head -6',
            ipv4, sshUser, 3, password
          );
          const lines = interfaces.split('\n').filter(l => l.trim());
          fingerprint.network = { interfaces: [] };
          let currentInterface = '';
          for (const line of lines) {
            if (line.includes(':')) {
              currentInterface = line.split(':')[1].trim();
            } else if (line.includes('inet ')) {
              const ipMatch = line.match(/inet\s+([^\s]+)/);
              if (ipMatch && currentInterface) {
                fingerprint.network!.interfaces!.push({ name: currentInterface, ip: ipMatch[1].split('/')[0] });
              }
            }
          }
        } catch (e) {}

        // Check WireGuard - use dynamic path finding
        try {
          const wgCheck = await this.sshService.executeCommand(
            'which wg 2>/dev/null && echo "installed" || echo "not-installed"',
            ipv4, sshUser, 3, password
          );
          if (wgCheck && wgCheck.includes('installed')) {
            const wgPath = await this.findWireGuardConfigPath(ipv4, sshUser, osInfo, password) || '/etc/wireguard/wg0.conf';
            fingerprint.wireguard = { installed: true, configPath: wgPath };
            try {
              const wgConfig = await this.sshService.executeCommand(
                `sudo cat ${wgPath} 2>/dev/null || cat ${wgPath} 2>/dev/null || echo ""`,
                ipv4, sshUser, 3, password
              );
              if (wgConfig && !wgConfig.includes('No such file') && !wgConfig.includes('Permission denied')) {
                const listenPortMatch = wgConfig.match(/ListenPort\s*=\s*(\d+)/i);
                const addressMatch = wgConfig.match(/Address\s*=\s*([^\s]+)/i);
                const pubKeyMatch = wgConfig.match(/PublicKey\s*=\s*([^\s]+)/i);
                if (listenPortMatch) fingerprint.wireguard!.listenPort = parseInt(listenPortMatch[1], 10);
                if (addressMatch) fingerprint.wireguard!.interfaceIP = addressMatch[1];
                if (pubKeyMatch) fingerprint.wireguard!.publicKey = pubKeyMatch[1];
              }
            } catch (e) {}
          } else {
            fingerprint.wireguard = { installed: false };
          }
        } catch (e) {
          fingerprint.wireguard = { installed: false };
        }
      }
    } catch (e) {
      this.logger.error(`Failed to get server fingerprint: ${e.message}`);
    }

    return fingerprint;
  }

  /**
   * Find WireGuard config path dynamically
   */
  private async findWireGuardConfigPath(ipv4: string, sshUser: string, osInfo: OSInfo, password?: string): Promise<string | null> {
    try {
      if (osInfo.type === 'windows') {
        // Windows: Try multiple possible paths
        const possiblePaths = [
          'C:\\Program Files\\WireGuard\\Data\\Configurations\\wg0.conf',
          'C:\\Program Files (x86)\\WireGuard\\Data\\Configurations\\wg0.conf',
          'C:\\ProgramData\\WireGuard\\Configurations\\wg0.conf',
          'C:\\Users\\Administrator\\AppData\\Local\\Packages\\WireGuard\\Data\\Configurations\\wg0.conf',
        ];

        // Also try to find via WireGuard service
        try {
          const wgService = await this.sshService.executeCommand(
            'powershell -Command "Get-Service -Name \"WireGuardTunnel*\" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Name"',
            ipv4, sshUser, 3, password
          );
          if (wgService && wgService.trim()) {
            // Try to get config path from service
            const servicePath = await this.sshService.executeCommand(
              `powershell -Command "(Get-WmiObject Win32_Service -Filter \"Name='${wgService.trim()}'\" | Select-Object -ExpandProperty PathName) -replace 'wireguard.exe', 'Data\\Configurations\\wg0.conf'"`,
              ipv4, sshUser, 3, password
            ).catch(() => null);
            if (servicePath && servicePath.trim()) {
              possiblePaths.unshift(servicePath.trim());
            }
          }
        } catch (e) {
          // Continue with default paths
        }

        // Try each path
        for (const path of possiblePaths) {
          try {
            const exists = await this.sshService.executeCommand(
              `powershell -Command "Test-Path '${path}'"`,
              ipv4, sshUser, 3, password
            );
            if (exists && exists.trim().toLowerCase() === 'true') {
              return path;
            }
          } catch (e) {
            // Try next path
          }
        }

        // Last resort: Search for wg0.conf in common locations
        try {
          const foundPath = await this.sshService.executeCommand(
            'powershell -Command "Get-ChildItem -Path \"C:\\Program Files\", \"C:\\Program Files (x86)\", \"C:\\ProgramData\" -Recurse -Filter \"wg0.conf\" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName"',
            ipv4, sshUser, 5, password
          );
          if (foundPath && foundPath.trim() && !foundPath.includes('Error')) {
            return foundPath.trim();
          }
        } catch (e) {
          // Search failed
        }

        return null;
      } else {
        // Linux/macOS: Try common paths
        const possiblePaths = [
          '/etc/wireguard/wg0.conf',
          '/usr/local/etc/wireguard/wg0.conf',
          '/opt/wireguard/wg0.conf',
          '~/wireguard/wg0.conf',
          '~/.config/wireguard/wg0.conf',
        ];

        // Try each path
        for (const path of possiblePaths) {
          try {
            const exists = await this.sshService.executeCommand(
              `test -f ${path} && echo "exists" || echo "notfound"`,
              ipv4, sshUser, 3, password
            );
            if (exists && exists.includes('exists')) {
              return path;
            }
          } catch (e) {
            // Try next path
          }
        }

        // Last resort: Use find command
        try {
          const foundPath = await this.sshService.executeCommand(
            'find /etc /usr/local /opt /home -name "wg0.conf" 2>/dev/null | head -1',
            ipv4, sshUser, 5, password
          );
          if (foundPath && foundPath.trim() && !foundPath.includes('No such file')) {
            return foundPath.trim();
          }
        } catch (e) {
          // Search failed
        }

        return null;
      }
    } catch (e) {
      this.logger.error(`Failed to find WireGuard config path: ${e.message}`);
      return null;
    }
  }

  /**
   * Fetch WireGuard config from remote server
   */
  async fetchWireGuardConfig(ipv4: string, sshUser: string = 'root', password?: string): Promise<string | null> {
    try {
      const osInfo = await this.detectOS(ipv4, sshUser, password);
      
      // First, try to find the config path dynamically
      const configPath = await this.findWireGuardConfigPath(ipv4, sshUser, osInfo, password);
      
      if (osInfo.type === 'windows') {
        if (configPath) {
          // Use found path
          const config = await this.sshService.executeCommand(
            `powershell -Command "Get-Content '${configPath}' -ErrorAction SilentlyContinue"`,
            ipv4, sshUser, 5, password
          ).catch(() => null);
          if (config && config.trim() && !config.includes('Cannot find path')) {
            return config;
          }
        }
        
        // Fallback: Try default path
        const defaultPath = 'C:\\Program Files\\WireGuard\\Data\\Configurations\\wg0.conf';
        const config = await this.sshService.executeCommand(
          `powershell -Command "Get-Content '${defaultPath}' -ErrorAction SilentlyContinue"`,
          ipv4, sshUser, 3, password
        ).catch(() => null);
        return config && !config.includes('Cannot find path') ? config : null;
      } else {
        if (configPath) {
          // Use found path (try with sudo first, then without)
          const config = await this.sshService.executeCommand(
            `sudo cat ${configPath} 2>/dev/null || cat ${configPath} 2>/dev/null || echo ""`,
            ipv4, sshUser, 5, password
          ).catch(() => null);
          if (config && config.trim() && !config.includes('No such file') && !config.includes('Permission denied')) {
            return config;
          }
        }
        
        // Fallback: Try default path
        const config = await this.sshService.executeCommand(
          'sudo cat /etc/wireguard/wg0.conf 2>/dev/null || cat /etc/wireguard/wg0.conf 2>/dev/null || echo ""',
          ipv4, sshUser, 3, password
        ).catch(() => null);
        return config && !config.includes('No such file') && config.trim() ? config : null;
      }
    } catch (e) {
      this.logger.error(`Failed to fetch WireGuard config: ${e.message}`);
      return null;
    }
  }
}

