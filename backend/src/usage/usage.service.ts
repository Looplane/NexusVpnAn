import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageRecord } from './entities/usage.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    @InjectRepository(UsageRecord)
    private usageRepo: Repository<UsageRecord>,
    private usersService: UsersService,
  ) {}

  // In a real app, this would run every few minutes to sync data from WireGuard interface counters.
  // For the MVP, we mock it to generate data so the frontend chart looks alive.
  @Cron(CronExpression.EVERY_MINUTE)
  async simulateUsageSync() {
    this.logger.debug('Running simulated usage sync...');
    
    // 1. Get a test user (or all users in prod)
    // For simplicity, we just add random data to the first user found or a specific ID
    // In a real scenario, we'd query the WG server interface stats via SSH.
    
    // Mock logic:
    const today = new Date().toISOString().split('T')[0];
    
    // Assuming we have a user context, here we just log for now
    // or perform a dummy insert if we knew a valid User ID.
    // Real implementation would look like:
    /*
    const users = await this.usersService.findAllActive();
    for (const user of users) {
        const up = Math.floor(Math.random() * 1000000);
        const down = Math.floor(Math.random() * 5000000);
        await this.recordUsage(user.id, up, down, today);
    }
    */
  }

  async recordUsage(userId: string, up: number, down: number, date: string) {
    let record = await this.usageRepo.findOne({
      where: { userId, recordDate: date },
    });

    if (!record) {
      record = this.usageRepo.create({
        userId,
        recordDate: date,
        bytesUploaded: '0',
        bytesDownloaded: '0',
      });
    }

    // Update stats (convert to BigInt for math, then string for storage)
    const currentUp = BigInt(record.bytesUploaded);
    const currentDown = BigInt(record.bytesDownloaded);
    
    record.bytesUploaded = (currentUp + BigInt(up)).toString();
    record.bytesDownloaded = (currentDown + BigInt(down)).toString();

    return this.usageRepo.save(record);
  }

  async getUserUsage(userId: string) {
    return this.usageRepo.find({
      where: { userId },
      order: { recordDate: 'DESC' },
      take: 30, // Last 30 days
    });
  }
}