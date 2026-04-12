# VendorSoluce Subscription System

## Overview

VendorSoluce uses Stripe for subscriptions with Supabase Edge Functions for checkout, webhooks, and subscription management.

## Flow

1. **Checkout**: `create-checkout-session` creates a Stripe Checkout session with `userId` and `plan` in metadata (or guest mode for `link-checkout-session` flow).
2. **Webhook**: `stripe-webhook` receives events, verifies signature via `stripe.webhooks.constructEvent`, and updates `vs_subscriptions` and `vs_profiles`.
3. **Guest checkout**: If no `userId` at checkout, user signs up and calls `link-checkout-session` with `session_id` to attach the subscription to their account.

## Required Secrets (Supabase Edge Functions)

| Secret | Purpose |
|--------|---------|
| `STRIPE_SECRET_KEY` | Stripe API and webhook verification |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypass RLS for webhook writes |
| `APP_URL` | Redirect URLs for checkout |

## Stripe Webhook Configuration

- **URL**: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
- **Events**: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `invoice.payment_action_required`, `invoice.upcoming`, `customer.subscription.trial_will_end`

## Tables

- `vs_subscriptions` — subscription records linked to `user_id`
- `vs_profiles` — `subscription_tier` synced from subscription or license
- `vs_customers` — Stripe customer ID per user

## Deploy

```bash
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout-session
supabase functions deploy link-checkout-session
supabase functions deploy cancel-subscription
```
