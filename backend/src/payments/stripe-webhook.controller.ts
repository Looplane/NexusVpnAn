import { Controller, Post, Headers, Req, BadRequestException, RawBodyRequest, Version } from '@nestjs/common';
import { PaymentsService } from './payments.service';

// Webhooks don't need versioning - they're external integrations
@Controller('payments/webhook')
export class StripeWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    try {
      // Get raw body for signature verification
      const rawBody = request.rawBody || Buffer.from(JSON.stringify(request.body));
      
      // Verify signature and construct event
      // In production, this MUST verify the signature
      let event: any;
      
      if (process.env.NODE_ENV === 'production' && process.env.STRIPE_WEBHOOK_SECRET) {
        // Production: Verify signature
        event = await this.paymentsService.constructEventFromPayload(rawBody, signature);
      } else {
        // Development: Trust the body (for testing)
        event = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString());
      }

      // Handle different event types
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        await this.paymentsService.handleCheckoutSessionCompleted(session);
      } else if (event.type === 'invoice.payment_failed') {
        await this.paymentsService.handlePaymentFailed(event.data.object);
      } else if (event.type === 'customer.subscription.deleted') {
        // Handle subscription cancellation
        const subscription = event.data.object;
        await this.paymentsService.handleSubscriptionDeleted(subscription);
      }

      return { received: true };
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}