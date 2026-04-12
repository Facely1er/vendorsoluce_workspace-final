// @ts-expect-error - Deno global is available in Supabase Edge Functions
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@19.1.0?target=deno';

const stripe = new Stripe(
  // @ts-expect-error - Deno global is available in Supabase Edge Functions
  Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
});

// Restrict CORS to the known application origin. APP_URL must be set in edge function secrets.
// @ts-expect-error - Deno global is available in Supabase Edge Functions
const allowedOrigin = Deno.env.get('APP_URL')?.trim() || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin || 'null', // deny if APP_URL not set
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Verify the caller has a valid Supabase JWT before doing anything else.
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Authentication required. Provide a Bearer token.' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');

    // Verify the JWT by calling Supabase auth.getUser with the user's token.
    // @ts-expect-error - Deno global is available in Supabase Edge Functions
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    // @ts-expect-error - Deno global is available in Supabase Edge Functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      // @ts-expect-error - Deno global is available in Supabase Edge Functions
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-expect-error - Deno global is available in Supabase Edge Functions
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    const { priceId, customerEmail, userId, plan, tier, billingPeriod, metadata, returnBaseUrl } = requestBody;

    // Normalize tier/plan and billing period for backends that require them
    const effectiveTier = tier ?? plan ?? 'professional';
    const effectiveBillingPeriod = billingPeriod ?? 'month';

    // Base URL for success/cancel redirects (Stripe requires absolute URLs). Prefer client-sent origin, then APP_URL secret.
    const rawBase = (returnBaseUrl && typeof returnBaseUrl === 'string' ? returnBaseUrl.trim() : null)
      || Deno.env.get('APP_URL')?.trim()
      || '';
    const baseUrl = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
    const isValidUrl = baseUrl.startsWith('https://') || baseUrl.startsWith('http://');
    if (!baseUrl || !isValidUrl) {
      return new Response(
        JSON.stringify({
          error: 'Redirect URL not configured',
          details: 'Set APP_URL in Supabase Edge Function secrets (e.g. https://www.platform.vendorsoluce.com) or ensure the app sends a valid returnBaseUrl.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields (priceId and plan always required; userId/customerEmail required only for logged-in flow)
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: priceId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isGuest = !userId;
    if (!isGuest && !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: customerEmail when userId is provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sessionOptions;

    if (isGuest) {
      // Guest checkout: send to sign-in so they can create an account and access their subscription
      sessionOptions = {
        customer_email: customerEmail || undefined,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/signin?from_checkout=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        subscription_data: {
          trial_period_days: effectiveTier === 'free' ? 0 : 14,
          metadata: { plan: effectiveTier, tier: effectiveTier, billingPeriod: effectiveBillingPeriod, guest: 'true', ...metadata },
        },
        metadata: { plan: effectiveTier, tier: effectiveTier, billingPeriod: effectiveBillingPeriod, guest: 'true', ...metadata },
      };
    } else {
      // Logged-in user: link to existing Stripe customer or create and save to vs_customers
      let customer;
      const { data: customerData } = await supabaseClient
        .from('vs_customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (customerData?.stripe_customer_id) {
        customer = await stripe.customers.retrieve(customerData.stripe_customer_id);
      } else {
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata: { userId, plan },
        });
        await supabaseClient
          .from('vs_customers')
          .insert({
            user_id: userId,
            stripe_customer_id: customer.id,
            email: customerEmail,
          });
      }

      sessionOptions = {
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        subscription_data: {
          trial_period_days: effectiveTier === 'free' ? 0 : 14,
          metadata: { userId, plan: effectiveTier, tier: effectiveTier, billingPeriod: effectiveBillingPeriod, ...metadata },
        },
        metadata: { userId, plan: effectiveTier, tier: effectiveTier, billingPeriod: effectiveBillingPeriod, ...metadata },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Checkout session error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: message,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});