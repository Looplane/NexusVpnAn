import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { EmailService } from './email.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private emailService: EmailService,
  ) {}

  async create(userId: string, title: string, message: string, type: 'info'|'success'|'warning'|'error' = 'info') {
    const n = this.notificationRepo.create({ userId, title, message, type });
    return this.notificationRepo.save(n);
  }

  async findAllForUser(userId: string) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20
    });
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationRepo.update({ id, userId }, { isRead: true });
    return { success: true };
  }

  // --- Hybrid Email + DB Notification ---

  async sendWelcome(userId: string, email: string, name: string) {
    await this.emailService.sendWelcomeEmail(email, name);
    await this.create(userId, 'Welcome to NexusVPN', 'Your account has been successfully created. Get started by downloading a config!', 'success');
  }

  async sendUpgrade(userId: string, email: string, plan: string) {
    await this.emailService.sendPlanUpgradeEmail(email, plan);
    await this.create(userId, 'Plan Upgraded', `You are now on the ${plan.toUpperCase()} plan. Enjoy the extra speed!`, 'success');
  }
}