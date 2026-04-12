// @ts-expect-error - Deno global is available in Supabase Edge Functions
declare const Deno: {
  env: { get: (key: string) => string | undefined };
};

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@19.1.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body: { sessionId?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const sessionId = body.sessionId;
    if (!sessionId || typeof sessionId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing required field: sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user?.email) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized or user not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Checkout session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // One-time payment (e.g. Starter $999) — no subscription; update profile tier only
    if (session.mode === 'payment' && !session.subscription) {
      const plan = (session.metadata?.plan || session.metadata?.tier || 'starter') as string;
      let sessionEmail: string | null =
        session.customer_email ||
        (typeof session.customer === 'object' && session.customer
          ? (session.customer as { email?: string })?.email ?? null
          : null);
      if (!sessionEmail && typeof session.customer === 'string') {
        const customer = await stripe.customers.retrieve(session.customer);
        sessionEmail = (customer as { email?: string })?.email ?? null;
      }
      if (!sessionEmail || sessionEmail.toLowerCase() !== user.email!.toLowerCase()) {
        return new Response(
          JSON.stringify({ error: 'Checkout session email does not match your account' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('vs_profiles')
        .update({ subscription_tier: plan, updated_at: now })
        .eq('id', user.id);
      if (updateError) {
        console.error('link-checkout-session profile update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to link checkout session', details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ linked: true, plan }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!session.subscription) {
      return new Response(
        JSON.stringify({ error: 'Checkout session or subscription not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sessionEmail: string | null =
      session.customer_email ||
      (typeof session.customer === 'object' && session.customer
        ? (session.customer as { email?: string })?.email ?? null
        : null);
    if (!sessionEmail && typeof session.customer === 'string') {
      const customer = await stripe.customers.retrieve(session.customer);
      sessionEmail = (customer as { email?: string })?.email ?? null;
    }
    if (!sessionEmail || sessionEmail.toLowerCase() !== user.email!.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Checkout session email does not match your account' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscriptionId = typeof session.subscription === 'object'
      ? session.subscription.id
      : session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const plan = (session.metadata?.plan || subscription.metadata?.plan || 'professional') as string;
    const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
    const now = new Date().toISOString();

    const { error: insertError } = await supabase.from('vs_subscriptions').insert({
      user_id: user.id,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      price_id: priceId,
      status: subscription.status,
      tier: plan,
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

    if (insertError) {
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ linked: true, message: 'Subscription already linked' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('link-checkout-session insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to link subscription', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase
      .from('vs_profiles')
      .update({ subscription_tier: plan, updated_at: now })
      .eq('id', user.id);

    return new Response(
      JSON.stringify({ linked: true, plan }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('link-checkout-session error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to link checkout session', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
