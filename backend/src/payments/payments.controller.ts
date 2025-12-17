import { Controller, Post, Get, Delete, Body, UseGuards, Request, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 checkout sessions per minute
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

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getBillingHistory(@Request() req) {
      return this.paymentsService.getBillingHistory(req.user.userId);
  }
}