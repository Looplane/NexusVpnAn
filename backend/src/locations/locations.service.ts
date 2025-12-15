

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from './entities/server.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SshService } from '../ssh/ssh.service';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    @InjectRepository(Server)
    private serverRepository: Repository<Server>,
    private sshService: SshService, // Inject SSH to check connectivity
  ) {}

  async findAll() {
    const servers = await this.serverRepository.find({ where: { isActive: true } });
    return servers.map(s => ({
      id: s.id,
      name: s.name,
      city: s.city,
      country: s.country,
      countryCode: s.countryCode,
      ipv4: s.ipv4,
      ping: 20 + Math.floor(s.currentLoad / 2), 
      load: s.currentLoad,
      premium: s.isPremium
    }));
  }

  async findOne(id: string) {
    return this.serverRepository.findOne({ where: { id } });
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkServerHealth() {
    // Skip health checks if in simulation mode
    if (process.env.MOCK_SSH === 'true') {
        return;
    }

    const servers = await this.serverRepository.find();
    
    for (const server of servers) {
        try {
            // Attempt a lightweight command
            await this.sshService.executeCommand('uname', server.ipv4, server.sshUser);
            
            if (!server.isActive) {
                this.logger.log(`Server ${server.name} is back ONLINE.`);
                server.isActive = true;
                await this.serverRepository.save(server);
            }

            // Get real server load from WireGuard
            try {
                const wgOutput = await this.sshService.executeCommand('sudo wg show wg0 dump | wc -l', server.ipv4, server.sshUser);
                const peerCount = parseInt(wgOutput.trim(), 10) - 1; // Subtract 1 for interface line
                // Calculate load based on peer count (assuming max 100 peers = 100% load)
                const newLoad = Math.min(100, Math.max(5, peerCount * 2));
                server.currentLoad = newLoad;
            } catch (e) {
                // If we can't get peer count, use a small random variation
                const change = Math.floor(Math.random() * 5) - 2;
                let newLoad = server.currentLoad + change;
                if (newLoad < 5) newLoad = 5;
                if (newLoad > 95) newLoad = 95;
                server.currentLoad = newLoad;
            }

            // Fetch WireGuard public key if not set
            if (!server.publicKey) {
                try {
                    const pubKey = await this.sshService.executeCommand('cat /etc/wireguard/publickey', server.ipv4, server.sshUser);
                    if (pubKey && !pubKey.includes('mock') && pubKey.length > 10) {
                        server.publicKey = pubKey.trim();
                        await this.serverRepository.save(server);
                        this.logger.log(`Fetched WireGuard public key for ${server.name}`);
                    }
                } catch (e) {
                    this.logger.debug(`Could not fetch public key for ${server.name}: ${e.message}`);
                }
            }

            await this.serverRepository.save(server);

        } catch (e) {
            if (server.isActive) {
                this.logger.warn(`Server ${server.name} is UNREACHABLE. Marking offline.`);
                server.isActive = false;
                server.currentLoad = 0;
                await this.serverRepository.save(server);
            }
        }
    }
  }
}