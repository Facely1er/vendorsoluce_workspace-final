// Reactivate Subscription Edge Function
// Removes the scheduled cancellation on a Stripe subscription that has
// cancel_at_period_end = true, restoring it to auto-renewing.

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

// @ts-expect-error - Deno imports are resolved at runtime
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-expect-error - Deno imports are resolved at runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-expect-error - Deno imports are resolved at runtime
import Stripe from 'https://esm.sh/stripe@19.1.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { subscriptionId, userId } = await req.json();

    if (!subscriptionId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: subscriptionId, userId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });

    // Verify the subscription belongs to this user.
    const { data: subscription, error: subError } = await supabase
      .from('vs_subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 },
      );
    }

    // Remove the scheduled cancellation in Stripe.
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    // Update local record.
    await supabase
      .from('vs_subscriptions')
      .update({
        cancel_at_period_end: false,
        cancel_at: null,
        grace_period_start: null,
        grace_period_end: null,
        is_read_only: false,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    return new Response(
      JSON.stringify({ success: true, message: 'Subscription reactivated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error('Error in reactivate-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});
