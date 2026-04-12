// Renewal Notification Cron Job
// Runs daily to check upcoming renewals and send notifications
// Policy: 7 days before monthly renewal, 30 days before annual renewal
// File: supabase/functions/renewal-notification-cron/index.ts

// @ts-expect-error - Deno global is available in Supabase Edge Functions
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results = {
      monthly7Day: 0,
      annual30Day: 0,
      errors: [] as string[],
    };

    const now = new Date();
    const baseUrl = Deno.env.get('SITE_URL') || Deno.env.get('APP_URL') || 'https://www.platform.vendorsoluce.com';

    // 1. Find monthly subscriptions renewing in 7 days
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStart = new Date(sevenDaysFromNow);
    sevenDaysStart.setHours(0, 0, 0, 0);
    const sevenDaysEnd = new Date(sevenDaysFromNow);
    sevenDaysEnd.setHours(23, 59, 59, 999);

    const { data: monthlyRenewals, error: monthlyError } = await supabase
      .from('vs_subscriptions')
      .select(`
        id,
        user_id,
        stripe_subscription_id,
        current_period_end,
        tier,
        status,
        price_id,
        vs_profiles!inner(email, full_name),
        vs_prices!inner(interval, price_amount)
      `)
      .eq('status', 'active')
      .eq('cancel_at_period_end', false)
      .eq('vs_prices.interval', 'month')
      .gte('current_period_end', sevenDaysStart.toISOString())
      .lte('current_period_end', sevenDaysEnd.toISOString());

    if (monthlyError) {
      results.errors.push(`Monthly renewal query: ${monthlyError.message}`);
    } else {
      for (const subscription of monthlyRenewals || []) {
        try {
          // This is a monthly subscription (filtered by interval = 'month')
            const profile = Array.isArray(subscription.vs_profiles) 
              ? subscription.vs_profiles[0] 
              : subscription.vs_profiles;

            if (profile?.email) {
              // Check if we've already sent this notification (track in metadata)
              const renewalDate = new Date(subscription.current_period_end);
              const renewalDateStr = renewalDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });

              // Get subscription amount from price record
              const price = Array.isArray(subscription.vs_prices) 
                ? subscription.vs_prices[0] 
                : subscription.vs_prices;
              const amount = price?.price_amount ? price.price_amount / 100 : 0;

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
                    <p>Hi ${profile.full_name || 'there'},</p>
                    <p>This is a reminder that your VendorSoluce subscription will renew in <strong>7 days</strong>.</p>
                    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
                      <h3 style="margin-top: 0;">Renewal Details</h3>
                      <p style="margin: 5px 0;"><strong>Renewal Date:</strong> ${renewalDateStr}</p>
                      <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)} USD</p>
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
              const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email-notification`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  to: profile.email,
                  subject: 'Your Subscription Renews in 7 Days - VendorSoluce',
                  html: emailHtml,
                  type: 'renewal_reminder_7days'
                }),
              });

              if (!emailResponse.ok) {
                const error = await emailResponse.text();
                results.errors.push(`7-day notification for user ${subscription.user_id}: ${error}`);
              } else {
                // Mark notification as sent in subscription metadata
                await supabase
                  .from('vs_subscriptions')
                  .update({
                    metadata: {
                      ...(subscription.metadata || {}),
                      renewal_notification_7days_sent: new Date().toISOString(),
                    }
                  })
                  .eq('id', subscription.id);
                results.monthly7Day++;
              }
            }
        } catch (error) {
          results.errors.push(`7-day notification for user ${subscription.user_id}: ${error.message}`);
        }
      }
    }

    // 2. Find annual subscriptions renewing in 30 days
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysStart = new Date(thirtyDaysFromNow);
    thirtyDaysStart.setHours(0, 0, 0, 0);
    const thirtyDaysEnd = new Date(thirtyDaysFromNow);
    thirtyDaysEnd.setHours(23, 59, 59, 999);

    const { data: annualRenewals, error: annualError } = await supabase
      .from('vs_subscriptions')
      .select(`
        id,
        user_id,
        stripe_subscription_id,
        current_period_end,
        tier,
        status,
        price_id,
        vs_profiles!inner(email, full_name),
        vs_prices!inner(interval, price_amount)
      `)
      .eq('status', 'active')
      .eq('cancel_at_period_end', false)
      .eq('vs_prices.interval', 'year')
      .gte('current_period_end', thirtyDaysStart.toISOString())
      .lte('current_period_end', thirtyDaysEnd.toISOString());

    if (annualError) {
      results.errors.push(`Annual renewal query: ${annualError.message}`);
    } else {
      for (const subscription of annualRenewals || []) {
        try {
          // This is an annual subscription (filtered by interval = 'year')
            const profile = Array.isArray(subscription.vs_profiles) 
              ? subscription.vs_profiles[0] 
              : subscription.vs_profiles;

            if (profile?.email) {
              const renewalDate = new Date(subscription.current_period_end);
              const renewalDateStr = renewalDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });

              // Get annual pricing from price record
              const price = Array.isArray(subscription.vs_prices) 
                ? subscription.vs_prices[0] 
                : subscription.vs_prices;
              const amount = price?.price_amount ? price.price_amount / 100 : 0;

              const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Annual Subscription Renewal Reminder</h1>
                  </div>
                  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p>Hi ${profile.full_name || 'there'},</p>
                    <p>This is a reminder that your VendorSoluce annual subscription will renew in <strong>30 days</strong>.</p>
                    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
                      <h3 style="margin-top: 0;">Renewal Details</h3>
                      <p style="margin: 5px 0;"><strong>Renewal Date:</strong> ${renewalDateStr}</p>
                      <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)} USD</p>
                      <p style="margin: 5px 0;"><strong>Plan:</strong> ${subscription.tier || 'Current Plan'} (Annual)</p>
                    </div>
                    <p>Your annual subscription will automatically renew using your payment method on file. No action is required to continue service.</p>
                    <p>If you wish to cancel or make changes to your subscription, you can do so anytime before the renewal date:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${baseUrl}/billing" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Manage Subscription</a>
                    </div>
                    <p><strong>Note:</strong> Annual subscriptions are non-refundable. If you cancel before renewal, you will retain access until the end of your current annual period, but no prorated refund will be issued.</p>
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
                  subject: 'Your Annual Subscription Renews in 30 Days - VendorSoluce',
                  html: emailHtml,
                  type: 'renewal_reminder_30days'
                }),
              });

              if (!emailResponse.ok) {
                const error = await emailResponse.text();
                results.errors.push(`30-day notification for user ${subscription.user_id}: ${error}`);
              } else {
                // Mark notification as sent in subscription metadata
                await supabase
                  .from('vs_subscriptions')
                  .update({
                    metadata: {
                      ...(subscription.metadata || {}),
                      renewal_notification_30days_sent: new Date().toISOString(),
                    }
                  })
                  .eq('id', subscription.id);
                results.annual30Day++;
              }
            }
        } catch (error) {
          results.errors.push(`30-day notification for user ${subscription.user_id}: ${error.message}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        results,
        message: `Processed: ${results.monthly7Day} monthly 7-day notifications, ${results.annual30Day} annual 30-day notifications`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in renewal-notification-cron:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
