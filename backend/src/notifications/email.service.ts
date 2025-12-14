import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  // In a real app, inject a mailer provider here (e.g., SendGrid, Nodemailer)

  async sendWelcomeEmail(email: string, name: string) {
    this.logger.log(`[Email Mock] Sending Welcome Email to ${email}`);
    // console.log(`Subject: Welcome to NexusVPN!`);
    // console.log(`Body: Hi ${name}, thanks for joining the future of privacy...`);
  }

  async sendPlanUpgradeEmail(email: string, plan: string) {
    this.logger.log(`[Email Mock] Sending Upgrade Confirmation to ${email}`);
    // console.log(`Subject: You are now on the ${plan} Plan!`);
  }

  async sendInvoiceReceipt(email: string, amount: number) {
     this.logger.log(`[Email Mock] Sending Invoice Receipt to ${email} for $${amount}`);
  }
}