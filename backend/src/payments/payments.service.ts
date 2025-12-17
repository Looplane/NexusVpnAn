import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';
import { UserPlan } from '../users/entities/user.entity';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2023-10-16' as any,
    });
  }

  async createCheckoutSession(userId: string, plan: string) {
    if (!process.env.STRIPE_SECRET_KEY) {
        this.logger.log(`Creating mock checkout session for user ${userId} plan ${plan}`);
        return { url: 'https://example.com/mock-checkout-success' }; 
    }

    const priceId = this.getPriceIdForPlan(plan);
    const user = await this.usersService.findOneById(userId);
    
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email, // Use email to pre-fill or create customer
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings`,
      metadata: { userId, plan },
    });

    return { url: session.url };
  }

  async createPortalSession(userId: string) {
      const user = await this.usersService.findOneById(userId);
      if (!user.stripeCustomerId) {
          throw new NotFoundException('No billing account found for this user.');
      }

      if (!process.env.STRIPE_SECRET_KEY) return { url: '#' };

      const session = await this.stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings`,
      });

      return { url: session.url };
  }

  async cancelSubscription(userId: string) {
      const user = await this.usersService.findOneById(userId);
      // In real implementation, query Stripe for active sub ID via Customer ID
      // await this.stripe.subscriptions.cancel(subId);
      
      this.logger.log(`Canceling subscription for user ${userId}`);
      
      // Downgrade immediately for MVP (Real world: wait for webhook 'customer.subscription.deleted')
      user.plan = UserPlan.FREE;
      await this.usersService.update(userId, { ...user, password: undefined });
      
      return { success: true };
  }

  // --- Webhook Handling ---

  async handleCheckoutSessionCompleted(session: any) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (userId && plan) {
      this.logger.log(`Payment successful. Upgrading user ${userId} to ${plan}.`);
      
      const user = await this.usersService.findOneById(userId);
      if (user) {
        user.plan = plan as UserPlan;
        user.stripeCustomerId = session.customer as string;
        await this.usersService.update(userId, { ...user, password: undefined });
        this.emailService.sendPlanUpgradeEmail(user.email, plan);
      }
    }
  }

  /**
   * Handle payment failed webhook event
   * 
   * When a payment fails, we should:
   * 1. Find the user by Stripe customer ID
   * 2. Log the failure
   * 3. Send notification email
   * 4. Optionally downgrade after grace period (not implemented yet)
   * 
   * @param invoice - Stripe invoice object from webhook
   * 
   * @fix Implemented user lookup and email notification
   */
  async handlePaymentFailed(invoice: any) {
      const customerId = invoice.customer;
      
      // Find user by Stripe customer ID
      const user = await this.usersService.findByStripeId(customerId);
      
      if (user) {
        this.logger.warn(`Payment failed for user ${user.id} (${user.email}). Customer: ${customerId}`);
        
      // Send payment failed notification email
      this.emailService.sendPaymentFailedEmail(user.email, invoice.amount_due / 100); // Convert cents to dollars
        
        // TODO: Implement grace period logic
        // After X failed attempts, downgrade to FREE plan
        // For now, just log the failure
      } else {
        this.logger.warn(`Payment failed for unknown customer ${customerId}`);
      }
  }

  /**
   * Handle subscription deleted webhook event
   * 
   * When a subscription is cancelled/deleted:
   * 1. Find the user by Stripe customer ID
   * 2. Downgrade user to FREE plan
   * 3. Send cancellation confirmation email
   * 
   * @param subscription - Stripe subscription object from webhook
   * 
   * @fix Implemented user lookup, plan downgrade, and email notification
   */
  async handleSubscriptionDeleted(subscription: any) {
    const customerId = subscription.customer;
    this.logger.log(`Subscription deleted for customer ${customerId}`);
    
    // Find user by stripeCustomerId and downgrade to FREE
    const user = await this.usersService.findByStripeId(customerId);
    
    if (user) {
      // Downgrade to FREE plan
      user.plan = UserPlan.FREE;
      await this.usersService.update(user.id, { ...user, password: undefined });
      
      this.logger.log(`User ${user.id} downgraded to FREE plan after subscription cancellation`);
      
      // Send cancellation confirmation email
      this.emailService.sendSubscriptionCancelledEmail(user.email);
    } else {
      this.logger.warn(`Subscription deleted for unknown customer ${customerId}`);
    }
  }

  async getBillingHistory(userId: string) {
      const user = await this.usersService.findOneById(userId);
      
      // In a real implementation, query Stripe for invoices
      // For now, return mock data based on user plan
      if (!process.env.STRIPE_SECRET_KEY || !user.stripeCustomerId) {
          this.logger.log(`Returning mock billing history for user ${userId}`);
          const planName = user.plan === UserPlan.PRO ? 'Pro' : user.plan === UserPlan.BASIC ? 'Basic' : 'Free';
          const amount = user.plan === UserPlan.PRO ? 999 : user.plan === UserPlan.BASIC ? 499 : 0;
          
          // Return format matching BillingInvoice interface
          return [
              {
                  id: 'inv_mock_1',
                  date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Format: YYYY-MM-DD
                  amount: amount, // Amount in cents
                  status: amount > 0 ? 'paid' : 'free',
                  planName: planName,
                  pdfUrl: amount > 0 ? '#' : undefined,
              },
          ];
      }

      // Real Stripe implementation
      // @fix Implemented real Stripe invoice fetching
      try {
        const invoices = await this.stripe.invoices.list({ 
          customer: user.stripeCustomerId,
          limit: 50, // Get last 50 invoices
        });
        
        return invoices.data.map(inv => ({
          id: inv.id,
          date: new Date(inv.created * 1000).toISOString().split('T')[0],
          amount: inv.amount_paid,
          status: inv.status === 'paid' ? 'paid' : inv.status === 'open' ? 'pending' : 'failed',
          planName: inv.metadata?.plan || inv.subscription_details?.metadata?.plan || 'Unknown',
          pdfUrl: inv.invoice_pdf || undefined,
        }));
      } catch (error) {
        this.logger.error(`Failed to fetch billing history from Stripe: ${error.message}`);
        // Return empty array on error
        return [];
      }
  }

  private getPriceIdForPlan(plan: string) {
      const map = {
          'basic': 'price_basic_123',
          'pro': 'price_pro_456'
      };
      return map[plan] || 'price_basic_123';
  }

  /**
   * Construct Stripe event from raw body and signature
   * This is required for production webhook signature verification
   */
  async constructEventFromPayload(
    rawBody: Buffer | string,
    signature: string,
  ): Promise<Stripe.Event> {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not set, skipping signature verification');
      // In development, parse as JSON
      if (typeof rawBody === 'string') {
        return JSON.parse(rawBody) as Stripe.Event;
      }
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
      return event;
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }
}