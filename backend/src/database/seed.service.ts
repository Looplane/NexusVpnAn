import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserPlan } from '../users/entities/user.entity';
import { Server } from '../locations/entities/server.entity';
import { UsageRecord } from '../usage/entities/usage.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Server) private serverRepo: Repository<Server>,
    @InjectRepository(UsageRecord) private usageRepo: Repository<UsageRecord>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
    await this.seedServers();
    await this.seedUsage();
  }

  private async seedUsers() {
    const count = await this.userRepo.count();
    if (count > 0) return;

    this.logger.log('Seeding Users...');
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash('password', salt);

    await this.userRepo.save([
      {
        email: 'admin@nexusvpn.com',
        passwordHash,
        fullName: 'System Administrator',
        role: UserRole.ADMIN,
        plan: UserPlan.PRO,
      },
      {
        email: 'demo@nexusvpn.com',
        passwordHash,
        fullName: 'Demo User',
        role: UserRole.USER,
        plan: UserPlan.BASIC,
      },
    ]);
  }

  private async seedServers() {
    this.logger.log('Seeding Servers...');
    
    // Check if Ubuntu deployment server exists
    const ubuntuServer = await this.serverRepo.findOne({ where: { ipv4: '5.161.91.222' } });
    if (!ubuntuServer) {
      this.logger.log('Adding Ubuntu deployment server (5.161.91.222)...');
      await this.serverRepo.save({
        name: 'NexusVPN Main Server',
        city: 'Ashburn',
        country: 'United States',
        countryCode: 'US',
        ipv4: '5.161.91.222',
        wgPort: 51820,
        sshUser: 'root',
        isPremium: false,
        isActive: true,
      });
    }

    // Only seed dummy servers if no servers exist
    const count = await this.serverRepo.count();
    if (count > 1) return; // More than just the Ubuntu server

    this.logger.log('Seeding default servers...');
    await this.serverRepo.save([
      { name: 'US East Node', city: 'New York', country: 'United States', countryCode: 'US', ipv4: '192.168.100.1', isPremium: false },
      { name: 'US West Node', city: 'Los Angeles', country: 'United States', countryCode: 'US', ipv4: '192.168.100.2', isPremium: false },
      { name: 'EU Central Node', city: 'Frankfurt', country: 'Germany', countryCode: 'DE', ipv4: '192.168.100.3', isPremium: false },
      { name: 'Asia Pacific Node', city: 'Tokyo', country: 'Japan', countryCode: 'JP', ipv4: '192.168.100.4', isPremium: true },
      { name: 'UK South Node', city: 'London', country: 'United Kingdom', countryCode: 'GB', ipv4: '192.168.100.5', isPremium: true },
    ]);
  }

  private async seedUsage() {
    const usageCount = await this.usageRepo.count();
    if (usageCount > 0) return;

    const demoUser = await this.userRepo.findOne({ where: { email: 'demo@nexusvpn.com' } });
    if (!demoUser) return;

    this.logger.log('Seeding Usage History...');
    const records = [];
    const now = new Date();
    
    // Generate last 30 days of data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Random daily usage between 100MB and 2GB
      const dailyUp = Math.floor(Math.random() * 500 * 1024 * 1024);
      const dailyDown = Math.floor(Math.random() * 2000 * 1024 * 1024);

      records.push({
        userId: demoUser.id,
        recordDate: dateStr,
        bytesUploaded: dailyUp.toString(),
        bytesDownloaded: dailyDown.toString(),
      });
    }
    await this.usageRepo.save(records);
  }
}