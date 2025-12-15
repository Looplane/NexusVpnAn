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
      // Skip if in simulation mode
      if (process.env.MOCK_SSH === 'true') {
          this.logger.debug(`Skipping reconciliation for ${server.name} (MOCK_SSH=true)`);
          return;
      }

      // 1. Get real state from WireGuard
      const dump = await this.sshService.executeCommand('sudo wg show wg0 dump', server.ipv4, server.sshUser);
      // Format: PUBLIC_KEY PRESHARED_KEY ENDPOINT ALLOWED_IPS ...
      
      if (!dump || dump.includes('mock-success') || dump.includes('SIMULATION')) {
          this.logger.debug(`No real WireGuard data from ${server.name}`);
          return;
      }

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
          // Skip if in simulation mode
          if (process.env.MOCK_SSH === 'true') {
              this.logger.debug(`Skipping usage sync for ${server.name} (MOCK_SSH=true)`);
              return;
          }

          const output = await this.sshService.executeCommand('sudo wg show wg0 transfer', server.ipv4, server.sshUser);
          if (!output || output.includes('mock-success') || output.includes('SIMULATION')) {
              this.logger.debug(`No real usage data from ${server.name}`);
              return;
          }

          const lines = output.trim().split('\n').filter(line => line.trim());
          if (lines.length === 0) return;

          const configs = await this.configRepo.find({ where: { locationId: server.id }, relations: ['user'] });
          const configMap = new Map<string, VpnConfig>();
          configs.forEach(c => configMap.set(c.publicKey, c));

          const today = new Date().toISOString().split('T')[0];
          let syncedCount = 0;

          for (const line of lines) {
              const parts = line.trim().split('\t');
              if (parts.length < 3) continue;

              const pubKey = parts[0];
              const rxStr = parts[1]?.trim() || '0'; // Received bytes (cumulative) - server received = client uploaded
              const txStr = parts[2]?.trim() || '0'; // Transmitted bytes (cumulative) - server sent = client downloaded

              const config = configMap.get(pubKey);
              
              if (config && config.user) {
                  try {
                      // Parse cumulative bytes from WireGuard
                      // WireGuard shows cumulative transfer since interface start
                      // We store the maximum cumulative value for the day
                      const currentRx = BigInt(rxStr); // Server received = Client uploaded
                      const currentTx = BigInt(txStr); // Server sent = Client downloaded
                      
                      // Convert to numbers (safe for values up to Number.MAX_SAFE_INTEGER)
                      // For very large values, we'll use the string directly
                      const bytesUp = currentRx > BigInt(Number.MAX_SAFE_INTEGER) 
                          ? Number.MAX_SAFE_INTEGER 
                          : Number(currentRx);
                      const bytesDown = currentTx > BigInt(Number.MAX_SAFE_INTEGER)
                          ? Number.MAX_SAFE_INTEGER
                          : Number(currentTx);
                      
                      // Only record if there's actual data
                      if (bytesDown > 0 || bytesUp > 0) {
                          // Record usage (bytesUp = client upload, bytesDown = client download)
                          // recordUsage will store the maximum cumulative value
                          await this.usageService.recordUsage(config.userId, bytesUp, bytesDown, today);
                          syncedCount++;
                      }
                  } catch (e) {
                      this.logger.warn(`Error parsing usage for peer ${pubKey.substring(0, 8)}...: ${e.message}`);
                  }
              }
          }

          if (syncedCount > 0) {
              this.logger.debug(`Synced usage for ${syncedCount} peers on ${server.name}`);
          }
      } catch (e) {
          // Don't crash on usage sync fail, just log
          this.logger.debug(`Usage sync skipped for ${server.name}: ${e.message}`);
      }
  }
}