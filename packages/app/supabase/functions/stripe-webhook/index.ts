// @ts-expect-error - Deno global is available in Supabase Edge Functions
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

// Stripe Webhook Handler for Supabase Edge Functions
// File: supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@19.1.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // @ts-expect-error - Deno global is available in Supabase Edge Functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // @ts-expect-error - Deno global is available in Supabase Edge Functions
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabase, event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event.data.object);
        break;
      
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(supabase, event.data.object);
        break;
      
      case 'invoice.payment_action_required':
        await handlePaymentActionRequired(supabase, event.data.object);
        break;
      
      case 'invoice.upcoming':
        await handleInvoiceUpcoming(supabase, event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Webhook event handlers - use vs_subscriptions and vs_profiles (app schema)

async function handleCheckoutCompleted(supabase: any, session: any) {
  console.log('Handling checkout.session.completed:', session.id);

  try {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan || 'professional';

    if (userId) {
      const { error } = await supabase
        .from('vs_profiles')
        .update({
          subscription_tier: plan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating vs_profiles tier:', error);
        throw error;
      }
      console.log('Updated vs_profiles.subscription_tier for user:', userId);
    }
    // Guest checkout: no userId; subscription will be linked via link-checkout-session after signup
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(supabase: any, subscription: any) {
  console.log('Handling customer.subscription.created:', subscription.id);

  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.log('Guest checkout: skipping vs_subscriptions insert (will link after signup)');
    return;
  }

  try {
    const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
    const tier = subscription.metadata?.plan || 'professional';
    const now = new Date().toISOString();

    const { error } = await supabase.from('vs_subscriptions').insert({
      user_id: userId,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      price_id: priceId,
      status: subscription.status,
      tier,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      metadata: subscription.metadata ? (subscription.metadata as object) : null,
      created_at: now,
      updated_at: now,
    });

    if (error) {
      console.error('Error inserting vs_subscriptions:', error);
      throw error;
    }
    console.log('vs_subscriptions created for user:', userId);
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: any) {
  console.log('Handling customer.subscription.updated:', subscription.id);

  try {
    const { error } = await supabase
      .from('vs_subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
        trial_start: subscription.trial_start
          ? new Date(subscription.trial_start * 1000).toISOString()
          : null,
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating vs_subscriptions:', error);
      throw error;
    }
    console.log('vs_subscriptions updated');
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  console.log('Handling customer.subscription.deleted:', subscription.id);

  try {
    const now = new Date().toISOString();

    const { data: row, error: fetchError } = await supabase
      .from('vs_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    const { error } = await supabase
      .from('vs_subscriptions')
      .update({
        status: 'canceled',
        cancel_at: now,
        updated_at: now,
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating vs_subscriptions:', error);
      throw error;
    }

    if (!fetchError && row?.user_id) {
      await supabase
        .from('vs_profiles')
        .update({ subscription_tier: 'free', updated_at: now })
        .eq('id', row.user_id);
    }
    console.log('vs_subscriptions canceled, tier reset if applicable');
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(supabase: any, invoice: any) {
  console.log('Handling invoice.payment_succeeded:', invoice.id);
  
  try {
    // Insert invoice record
    const { error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        subscription_id: invoice.subscription,
        stripe_invoice_id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'paid',
        paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
        created_at: new Date().toISOString()
      });

    if (invoiceError) {
      console.error('Error inserting invoice:', invoiceError);
      throw invoiceError;
    }

    const { error: subscriptionError } = await supabase
      .from('vs_subscriptions')
      .update({ updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', invoice.subscription);

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError);
      throw subscriptionError;
    }

    console.log('Payment succeeded - records updated');
  } catch (error) {
    console.error('Error in handlePaymentSucceeded:', error);
    throw error;
  }
}

async function handlePaymentFailed(supabase: any, invoice: any) {
  console.log('Handling invoice.payment_failed:', invoice.id);

  try {
    const { error } = await supabase
      .from('vs_subscriptions')
      .update({ updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }

    console.log('Payment failed - subscription updated');
  } catch (error) {
    console.error('Error in handlePaymentFailed:', error);
    throw error;
  }
}

async function handleTrialWillEnd(supabase: any, subscription: any) {
  console.log('Handling customer.subscription.trial_will_end:', subscription.id);
  
  try {
    // Send notification to user about trial ending
    // This would typically trigger an email notification
    console.log('Trial will end for subscription:', subscription.id);
    
    // You could add logic here to send emails or notifications
    // For now, we'll just log it
    
  } catch (error) {
    console.error('Error in handleTrialWillEnd:', error);
    throw error;
  }
}

async function handlePaymentActionRequired(supabase: any, invoice: any) {
  console.log('Handling invoice.payment_action_required:', invoice.id);
  
  try {
    // Update subscription status to indicate payment action required
    const { error } = await supabase
      .from('vs_subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }

    console.log('Payment action required - subscription updated');
  } catch (error) {
    console.error('Error in handlePaymentActionRequired:', error);
    throw error;
  }
}

async function handleInvoiceUpcoming(supabase: any, invoice: any) {
  console.log('Handling invoice.upcoming:', invoice.id);
  
  try {
    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('vs_subscriptions')
      .select('*')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (subError || !subscription) {
      console.error('Error fetching subscription:', subError);
      return; // Don't throw - this is not critical
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('vs_profiles')
      .select('email, full_name')
      .eq('id', subscription.user_id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return; // Don't throw - this is not critical
    }

    // Calculate days until renewal
    const renewalDate = new Date(invoice.period_end * 1000);
    const now = new Date();
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Determine if we should send notification based on billing cycle
    // Policy: 7 days for monthly, 30 days for annual
    const isAnnual = invoice.period_end - invoice.period_start > 30 * 24 * 60 * 60; // More than 30 days
    const shouldNotify = isAnnual ? daysUntilRenewal === 30 : daysUntilRenewal === 7;

    if (!shouldNotify) {
      console.log(`Skipping notification - days until renewal: ${daysUntilRenewal}, isAnnual: ${isAnnual}`);
      return;
    }

    // Get user email
    const userEmail = profile.email;
    const userName = profile.full_name || 'there';

    if (!userEmail) {
      console.error('No email found for subscription');
      return;
    }

    // Generate renewal notification email
    const baseUrl = Deno.env.get('SITE_URL') || Deno.env.get('APP_URL') || 'https://www.platform.vendorsoluce.com';
    const amount = (invoice.amount_due / 100).toFixed(2);
    const currency = invoice.currency.toUpperCase();
    const renewalDateStr = renewalDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Subscription Renewal Reminder</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hi ${userName},</p>
          <p>This is a reminder that your VendorSoluce subscription will renew in <strong>${daysUntilRenewal} day${daysUntilRenewal > 1 ? 's' : ''}</strong>.</p>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0;">Renewal Details</h3>
            <p style="margin: 5px 0;"><strong>Renewal Date:</strong> ${renewalDateStr}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ${currency} $${amount}</p>
            <p style="margin: 5px 0;"><strong>Plan:</strong> ${subscription.tier || 'Current Plan'}</p>
          </div>
          <p>Your subscription will automatically renew using your payment method on file. No action is required to continue service.</p>
          <p>If you wish to cancel or make changes to your subscription, you can do so anytime before the renewal date:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/billing" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Manage Subscription</a>
          </div>
          <p>Questions? <a href="${baseUrl}/contact">Contact our support team</a> - we're here to help!</p>
          <p>Best regards,<br>The VendorSoluce Team</p>
        </div>
      </body>
      </html>
    `;

    // Send email notification
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userEmail,
        subject: `Your Subscription Renews in ${daysUntilRenewal} Day${daysUntilRenewal > 1 ? 's' : ''} - VendorSoluce`,
        html: emailHtml,
        type: 'renewal_reminder'
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error('Error sending renewal notification email:', error);
      // Don't throw - email failures shouldn't break webhook processing
    } else {
      console.log('Renewal notification email sent successfully');
    }

  } catch (error) {
    console.error('Error in handleInvoiceUpcoming:', error);
    // Don't throw - email failures shouldn't break webhook processing
  }
}