import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VpnConfig } from './entities/vpn-config.entity';
import { Server } from '../locations/entities/server.entity';
import { SshService } from '../ssh/ssh.service';
import { UsageService } from '../usage/usage.service';

@Injectable()
export class VpnSyncService {
  private readonly logger = new Logger(VpnSyncService.name);

  constructor(
    @InjectRepository(VpnConfig)
    private configRepo: Repository<VpnConfig>,
    @InjectRepository(Server)
    private serverRepo: Repository<Server>,
    private sshService: SshService,
    private usageService: UsageService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncAllServers() {
    this.logger.log('Starting full server synchronization...');
    const servers = await this.serverRepo.find({ where: { isActive: true } });

    for (const server of servers) {
      await this.reconcileServerState(server);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncUsage() {
      const servers = await this.serverRepo.find({ where: { isActive: true } });
      for (const server of servers) {
          await this.collectUsageStats(server);
      }
  }

  /**
   * Reconcile State: DB vs Reality
   * 1. If Peer is in DB but missing on Server -> Add it (Resurrection)
   * 2. If Peer is on Server but missing in DB -> Remove it (Zombie Killing)
   */
  private async reconcileServerState(server: Server) {
    try {
      // 1. Get real state from WireGuard
      const dump = await this.sshService.executeCommand('sudo wg show wg0 dump', server.ipv4, server.sshUser);
      // Format: PUBLIC_KEY PRESHARED_KEY ENDPOINT ALLOWED_IPS ...
      
      if (!dump || dump.includes('mock-success')) return;

      const lines = dump.split('\n').slice(1); 
      const realKeys = new Set<string>();

      for (const line of lines) {
          const parts = line.split('\t');
          if (parts.length < 1) continue;
          realKeys.add(parts[0]);
      }

      // 2. Get expected state from DB
      const dbConfigs = await this.configRepo.find({ where: { locationId: server.id } });
      const dbKeyMap = new Map<string, VpnConfig>();
      dbConfigs.forEach(c => dbKeyMap.set(c.publicKey, c));

      // 3. Logic: Resurrect Missing Peers
      for (const config of dbConfigs) {
          if (!realKeys.has(config.publicKey)) {
              this.logger.warn(`[Self-Healing] Peer ${config.publicKey.slice(0,8)} missing on ${server.name}. Resurrecting...`);
              await this.sshService.executeCommand(
                  `sudo wg set wg0 peer ${config.publicKey} allowed-ips ${config.assignedIp}`,
                  server.ipv4,
                  server.sshUser
              );
          }
      }

      // 4. Logic: Kill Zombie Peers
      for (const realKey of realKeys) {
          if (!dbKeyMap.has(realKey)) {
              this.logger.warn(`[Self-Healing] Zombie peer ${realKey.slice(0,8)} found on ${server.name}. Terminating...`);
              await this.sshService.executeCommand(
                  `sudo wg set wg0 peer ${realKey} remove`,
                  server.ipv4,
                  server.sshUser
              );
          }
      }

    } catch (e) {
      this.logger.error(`Failed to sync server ${server.name} (${server.ipv4}): ${e.message}`);
    }
  }

  private async collectUsageStats(server: Server) {
      try {
          const output = await this.sshService.executeCommand('sudo wg show wg0 transfer', server.ipv4, server.sshUser);
          if (!output || output.includes('mock-success')) return;

          const lines = output.trim().split('\n');
          const configs = await this.configRepo.find({ where: { locationId: server.id }, relations: ['user'] });
          const configMap = new Map<string, VpnConfig>();
          configs.forEach(c => configMap.set(c.publicKey, c));

          const today = new Date().toISOString().split('T')[0];

          for (const line of lines) {
              const [pubKey, rx, tx] = line.split('\t');
              const config = configMap.get(pubKey);
              
              if (config && config.user) {
                  const bytesDown = parseInt(tx); 
                  const bytesUp = parseInt(rx);
                  // Store cumulative stats
                  await this.usageService.recordUsage(config.userId, bytesUp, bytesDown, today);
              }
          }
      } catch (e) {
          // Don't crash on usage sync fail, just log
          // this.logger.debug(`Usage sync skipped for ${server.name}: ${e.message}`);
      }
  }
}