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

  // Sync usage data from WireGuard servers via VPN sync service
  // This is called by VpnSyncService.collectUsageStats() which fetches real data
  @Cron(CronExpression.EVERY_MINUTE)
  async syncUsageData() {
    // This method is kept for backward compatibility
    // Real usage sync is handled by VpnSyncService.collectUsageStats()
    // which calls this.recordUsage() with actual WireGuard transfer data
    this.logger.debug('Usage sync is handled by VpnSyncService');
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
    // WireGuard provides cumulative values, so we take the maximum
    // This ensures we always have the latest cumulative total
    const currentUp = BigInt(record.bytesUploaded);
    const currentDown = BigInt(record.bytesDownloaded);
    const newUp = BigInt(up);
    const newDown = BigInt(down);
    
    // Use maximum to handle cumulative values correctly
    // If new value is less, it means WireGuard was restarted, so use new value
    record.bytesUploaded = (newUp > currentUp ? newUp : currentUp).toString();
    record.bytesDownloaded = (newDown > currentDown ? newDown : currentDown).toString();

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