# Stripe Webhook Setup Guide

## Manual Webhook Configuration

Since Supabase CLI requires authentication, here's how to set up the webhook manually:

### 1. Deploy Supabase Function Manually

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: snrpdosiuwmdaegxkqux
3. Go to Functions section
4. Create a new function called `stripe-webhook`
5. Copy the code from `supabase/functions/stripe-webhook/index.ts`
6. Deploy the function

### 2. Configure Stripe Webhook

1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://snrpdosiuwmdaegxkqux.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
   - `invoice.payment_action_required`
5. Save the webhook secret (starts with `whsec_`)

### 3. Environment Variables

Add these to your production environment:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Test Webhook

Use Stripe CLI to test:
```bash
stripe listen --forward-to https://snrpdosiuwmdaegxkqux.supabase.co/functions/v1/stripe-webhook
```

## Alternative: Use Stripe CLI for Local Testing

For now, let's continue with the deployment and set up webhooks later.
