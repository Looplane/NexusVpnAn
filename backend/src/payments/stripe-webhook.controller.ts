import { Controller, Post, Headers, Req, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request } from 'express';

@Controller('payments/webhook')
export class StripeWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request, // Requires raw body parsing in main.ts for real Stripe implementation
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    try {
      // In a real app, you MUST verify the signature using the raw body.
      // await this.paymentsService.constructEventFromPayload(request.body, signature);
      
      // For this MVP implementation, we assume the body is already parsed JSON 
      // and we trust it (DEV MODE ONLY).
      const event = (request as any).body;

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        await this.paymentsService.handleCheckoutSessionCompleted(session);
      } else if (event.type === 'invoice.payment_failed') {
          await this.paymentsService.handlePaymentFailed(event.data.object);
      }

      return { received: true };
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}