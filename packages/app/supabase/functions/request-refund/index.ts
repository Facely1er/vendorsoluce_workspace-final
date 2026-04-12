// Request Refund Edge Function
// Handles refund requests per e-commerce policy
// File: supabase/functions/request-refund/index.ts

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@19.1.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(
  Deno.env.get('STRIPE_SECRET_KEY')!,
  { apiVersion: '2024-06-20' }
);

// Refund eligibility reasons per policy
const REFUND_REASONS = {
  technical_failure: 'Technical service failure',
  billing_error: 'Billing error or duplicate charge',
  discretionary: 'Discretionary refund (extenuating circumstances)',
  other: 'Other reason',
};

// Check refund eligibility based on policy
async function checkRefundEligibility(
  supabase: any,
  userId: string,
  invoiceId: string | null,
  reason: string,
  subscription: any
): Promise<{ eligible: boolean; message: string; details: any }> {
  const details: any = {
    reason,
    subscriptionType: subscription?.tier || 'unknown',
    subscriptionStatus: subscription?.status || 'unknown',
  };

  // Get invoice details if provided
  let invoice = null;
  if (invoiceId) {
    try {
      invoice = await stripe.invoices.retrieve(invoiceId);
      details.invoiceDate = new Date(invoice.created * 1000);
      details.daysSinceInvoice = Math.floor(
        (Date.now() - invoice.created * 1000) / (1000 * 60 * 60 * 24)
      );
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  }

  // Policy-based eligibility checks
  if (reason === 'technical_failure') {
    // Technical failures are generally eligible if reported promptly
    return {
      eligible: true,
      message: 'Technical failure refunds are eligible if reported promptly and verified.',
      details: { ...details, requiresVerification: true },
    };
  }

  if (reason === 'billing_error') {
    // Billing errors are always eligible
    return {
      eligible: true,
      message: 'Billing error refunds are eligible.',
      details: { ...details, requiresVerification: true },
    };
  }

  if (reason === 'discretionary') {
    // Discretionary refunds require manual review
    // Check if first-time user with minimal usage
    const subscriptionCreated = subscription?.created_at 
      ? new Date(subscription.created_at)
      : null;
    
    if (subscriptionCreated) {
      const daysSinceSubscription = Math.floor(
        (Date.now() - subscriptionCreated.getTime()) / (1000 * 60 * 60 * 24)
      );
      details.daysSinceSubscription = daysSinceSubscription;
      
      // First-time users with < 7 days and minimal usage may be eligible
      if (daysSinceSubscription <= 7) {
        return {
          eligible: true,
          message: 'Discretionary refund request submitted. Requires manual review.',
          details: { ...details, requiresManualReview: true, firstTimeUser: true },
        };
      }
    }

    return {
      eligible: true,
      message: 'Discretionary refund request submitted. Requires manual review.',
      details: { ...details, requiresManualReview: true },
    };
  }

  // Other reasons require manual review
  return {
    eligible: true,
    message: 'Refund request submitted. Requires manual review.',
    details: { ...details, requiresManualReview: true },
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const { invoiceId, reason, description, amount } = await req.json();

    if (!reason || !description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: reason, description' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validate reason
    if (!Object.keys(REFUND_REASONS).includes(reason)) {
      return new Response(
        JSON.stringify({ error: 'Invalid refund reason' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('vs_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError);
    }

    // Get invoice details if provided
    let invoice = null;
    let refundAmount = amount;
    let currency = 'usd';
    let paymentIntentId = null;

    if (invoiceId) {
      try {
        invoice = await stripe.invoices.retrieve(invoiceId);
        refundAmount = invoice.amount_paid || invoice.amount_due;
        currency = invoice.currency;
        paymentIntentId = invoice.payment_intent as string;
      } catch (error) {
        console.error('Error fetching invoice:', error);
        return new Response(
          JSON.stringify({ error: 'Invalid invoice ID' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }
    } else if (subscription) {
      // Get latest invoice for subscription
      try {
        const invoices = await stripe.invoices.list({
          customer: subscription.stripe_customer_id,
          limit: 1,
        });
        if (invoices.data.length > 0) {
          invoice = invoices.data[0];
          refundAmount = invoice.amount_paid || invoice.amount_due;
          currency = invoice.currency;
          paymentIntentId = invoice.payment_intent as string;
        }
      } catch (error) {
        console.error('Error fetching latest invoice:', error);
      }
    }

    // Check eligibility
    const eligibility = await checkRefundEligibility(
      supabase,
      user.id,
      invoice?.id || null,
      reason,
      subscription
    );

    // Create refund request
    const { data: refundRequest, error: insertError } = await supabase
      .from('vs_refund_requests')
      .insert({
        user_id: user.id,
        subscription_id: subscription?.id || null,
        invoice_id: invoice?.id || null,
        stripe_payment_intent_id: paymentIntentId,
        amount: refundAmount || 0,
        currency: currency,
        reason: reason,
        description: description,
        status: 'pending',
        eligibility_check: eligibility.details,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating refund request:', insertError);
      throw insertError;
    }

    // Send notification email to user
    const { data: profile } = await supabase
      .from('vs_profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    if (profile?.email) {
      const baseUrl = Deno.env.get('SITE_URL') || Deno.env.get('APP_URL') || 'https://www.platform.vendorsoluce.com';
      const amountFormatted = ((refundAmount || 0) / 100).toFixed(2);
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Refund Request Received</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${profile.full_name || 'there'},</p>
            <p>We've received your refund request and it's currently under review.</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0;">Request Details</h3>
              <p style="margin: 5px 0;"><strong>Request ID:</strong> ${refundRequest.id}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ${currency.toUpperCase()} $${amountFormatted}</p>
              <p style="margin: 5px 0;"><strong>Reason:</strong> ${REFUND_REASONS[reason as keyof typeof REFUND_REASONS]}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> Pending Review</p>
            </div>
            <p><strong>What happens next?</strong></p>
            <ul style="line-height: 1.8;">
              <li>Your request will be reviewed within <strong>5 business days</strong></li>
              <li>If approved, the refund will be processed within <strong>2 business days</strong></li>
              <li>Refunds typically appear in your account within <strong>5-10 business days</strong></li>
              <li>You'll receive an email notification when your request is processed</li>
            </ul>
            <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0;"><strong>Note:</strong> ${eligibility.message}</p>
            </div>
            <p>You can check the status of your refund request in your <a href="${baseUrl}/billing">billing settings</a>.</p>
            <p>Questions? <a href="${baseUrl}/contact">Contact our support team</a> - we're here to help!</p>
            <p>Best regards,<br>The VendorSoluce Team</p>
          </div>
        </body>
        </html>
      `;

      // Send email notification
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: profile.email,
          subject: 'Refund Request Received - VendorSoluce',
          html: emailHtml,
          type: 'refund_request_confirmation'
        }),
      });

      if (!emailResponse.ok) {
        console.error('Error sending refund request confirmation email');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        refundRequest: {
          id: refundRequest.id,
          status: refundRequest.status,
          amount: refundRequest.amount,
          currency: refundRequest.currency,
          eligibility: eligibility,
        },
        message: 'Refund request submitted successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in request-refund:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
