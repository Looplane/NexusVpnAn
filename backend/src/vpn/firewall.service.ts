
import { Injectable, Logger } from '@nestjs/common';
import { SshService } from '../ssh/ssh.service';

@Injectable()
export class FirewallService {
  private readonly logger = new Logger(FirewallService.name);

  constructor(private sshService: SshService) {}

  /**
   * Applies "Kill Switch" rules to a specific server.
   * This ensures that if the VPN interface (wg0) goes down, no traffic leaks via eth0.
   */
  async enableKillSwitch(serverIp: string, sshUser: string) {
    this.logger.log(`Enabling Kill Switch on ${serverIp}`);
    
    // 1. Deny all outgoing by default
    // 2. Allow outgoing on wg0
    // 3. Allow SSH (port 22)
    // 4. Allow UDP 51820 (WireGuard)
    
    const commands = [
      'ufw default deny outgoing',
      'ufw default deny incoming',
      'ufw allow out on wg0',
      'ufw allow out 53', // DNS
      'ufw allow out 22/tcp',
      'ufw allow 51820/udp',
      'ufw enable'
    ];

    try {
        for (const cmd of commands) {
            await this.sshService.executeCommand(cmd, serverIp, sshUser);
        }
        return { success: true, status: 'Kill Switch Active' };
    } catch (e) {
        this.logger.error(`Failed to enable Kill Switch: ${e.message}`);
        throw e;
    }
  }

  async disableKillSwitch(serverIp: string, sshUser: string) {
      this.logger.log(`Disabling Kill Switch on ${serverIp}`);
      try {
          await this.sshService.executeCommand('ufw default allow outgoing', serverIp, sshUser);
          return { success: true, status: 'Kill Switch Disabled' };
      } catch (e) {
          throw e;
      }
  }
}
