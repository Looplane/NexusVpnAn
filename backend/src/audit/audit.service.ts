import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { SystemSetting } from './entities/system-setting.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    @InjectRepository(SystemSetting) private settingsRepo: Repository<SystemSetting>,
  ) {}

  async log(action: string, actorId: string, targetId?: string, details?: string, ip?: string) {
    try {
      const log = this.auditRepo.create({
        action,
        actorId,
        targetId,
        details,
        ipAddress: ip,
      });
      await this.auditRepo.save(log);
    } catch (e) {
      this.logger.error(`Failed to create audit log: ${e.message}`);
    }
  }

  async getLogs(limit = 100) {
    return this.auditRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // --- System Settings ---

  async getSettings() {
    return this.settingsRepo.find();
  }

  async updateSetting(key: string, value: string) {
    let setting = await this.settingsRepo.findOne({ where: { key } });
    if (!setting) {
      setting = this.settingsRepo.create({ key, value });
    } else {
      setting.value = value;
    }
    await this.settingsRepo.save(setting);
    await this.log('SETTING_UPDATE', 'system', key, `Value changed to ${value}`);
    return setting;
  }

  async getSettingValue(key: string): Promise<string | null> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  // Seed default settings
  async seedSettings() {
    const defaults = [
      { key: 'maintenance_mode', value: 'false', description: 'Prevent new logins/registrations' },
      { key: 'allow_registration', value: 'true', description: 'Allow new users to sign up' },
      { key: 'max_devices_free', value: '1', description: 'Max devices for free tier' },
    ];

    for (const d of defaults) {
      const exists = await this.settingsRepo.findOne({ where: { key: d.key } });
      if (!exists) {
        await this.settingsRepo.save(d);
      }
    }
  }
}