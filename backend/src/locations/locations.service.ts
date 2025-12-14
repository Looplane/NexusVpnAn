

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

            // Simulate load fluctuation if online
            const change = Math.floor(Math.random() * 10) - 5;
            let newLoad = server.currentLoad + change;
            if (newLoad < 5) newLoad = 5;
            if (newLoad > 95) newLoad = 95;
            server.currentLoad = newLoad;
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