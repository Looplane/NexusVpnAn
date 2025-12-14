import { Controller, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(@Request() req, @Body('plan') plan: string) {
    return this.paymentsService.createCheckoutSession(req.user.userId, plan);
  }

  @UseGuards(JwtAuthGuard)
  @Post('portal')
  async createPortal(@Request() req) {
      return this.paymentsService.createPortalSession(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('subscription')
  async cancelSubscription(@Request() req) {
      return this.paymentsService.cancelSubscription(req.user.userId);
  }
}