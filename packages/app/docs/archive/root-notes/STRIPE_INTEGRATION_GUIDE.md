# VendorSoluce Stripe Integration Guide

## ✅ Integration Complete

The Stripe payment processing and subscription management system has been fully implemented. This guide covers setup, configuration, and usage.

## 📋 What's Been Implemented

### 1. **Core Infrastructure**
- ✅ Stripe SDK integration (`stripe` and `@stripe/stripe-js`)
- ✅ Database schema for subscriptions, customers, invoices, and usage tracking
- ✅ Product catalog configuration with 4 tiers (Free, Starter, Professional, Enterprise)
- ✅ Environment variable configuration

### 2. **Frontend Components**
- ✅ `CheckoutButton` - Handles Stripe checkout session creation
- ✅ `SubscriptionManager` - Manages current subscription and billing portal access
- ✅ `FeatureGate` - Controls access to features based on subscription tier
- ✅ `UsageLimitGate` - Enforces usage limits with upgrade prompts
- ✅ `BillingPage` - Complete billing management interface

### 3. **Backend Functions (Supabase Edge Functions)**
- ✅ `create-checkout-session` - Creates Stripe checkout sessions
- ✅ `stripe-webhook` - Handles Stripe webhook events
- ✅ `create-portal-session` - Creates Stripe billing portal sessions

### 4. **Hooks and Utilities**
- ✅ `useSubscription` - React hook for subscription state management
- ✅ `useUsageTracking` - React hook for usage tracking and limits
- ✅ Stripe configuration with product catalog
- ✅ Helper functions for formatting and calculations

## 🚀 Setup Instructions

### Step 1: Stripe Account Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard:
   - Test keys: `pk_test_...` and `sk_test_...`
   - Live keys: `pk_live_...` and `sk_live_...` (for production)

### Step 2: Create Products in Stripe Dashboard

Create the following products and prices in your Stripe Dashboard:

#### Starter Plan
```
Product Name: VendorSoluce Starter
Product ID: prod_starter
Price: $49/month
Price ID: price_starter_monthly
```

#### Professional Plan
```
Product Name: VendorSoluce Professional  
Product ID: prod_professional
Price: $149/month
Price ID: price_professional_monthly
```

#### Enterprise Plan
```
Product Name: VendorSoluce Enterprise
Product ID: prod_enterprise  
Price: $449/month
Price ID: price_enterprise_monthly
```

### Step 3: Configure Webhooks

1. In Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/functions/v1/stripe-webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret (`whsec_...`)

### Step 4: Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (Client-side)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
VITE_STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Stripe Product IDs
VITE_STRIPE_PRODUCT_STARTER=prod_starter
VITE_STRIPE_PRICE_STARTER=price_starter_monthly
VITE_STRIPE_PRODUCT_PROFESSIONAL=prod_professional
VITE_STRIPE_PRICE_PROFESSIONAL=price_professional_monthly
VITE_STRIPE_PRODUCT_ENTERPRISE=prod_enterprise
VITE_STRIPE_PRICE_ENTERPRISE=price_enterprise_monthly

# Application URLs
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:54321/functions/v1
```

### Step 5: Supabase Configuration

1. Set Edge Function secrets:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret
supabase secrets set APP_URL=https://your-domain.com
```

2. Run database migration:
```bash
supabase db push
```

3. Deploy Edge Functions:
```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy create-portal-session
```

## 💳 Usage Guide

### For Users

#### Subscribing to a Plan
1. Navigate to `/pricing`
2. Choose a plan and click "Subscribe"
3. Enter payment details in Stripe Checkout
4. Complete purchase
5. Automatically redirected to dashboard with active subscription

#### Managing Subscription
1. Go to `/billing` or Account → Billing
2. View current plan and usage
3. Click "Manage Billing" to:
   - Update payment method
   - Download invoices
   - Change plan
   - Cancel subscription

### For Developers

#### Protecting Features with FeatureGate

```tsx
import { FeatureGate } from '../components/billing/FeatureGate';

function AdvancedFeature() {
  return (
    <FeatureGate feature="advanced_analytics" requiredTier="professional">
      <AdvancedAnalyticsComponent />
    </FeatureGate>
  );
}
```

#### Enforcing Usage Limits

```tsx
import { UsageLimitGate } from '../components/billing/FeatureGate';
import { useUsageTracking } from '../hooks/useSubscription';

function SBOMScanner() {
  const { trackUsage } = useUsageTracking('sbom_scans');

  const handleScan = async () => {
    // Track usage before performing action
    const canProceed = await trackUsage(1);
    if (!canProceed) {
      // User has hit their limit
      return;
    }
    // Perform scan...
  };

  return (
    <UsageLimitGate feature="sbom_scans">
      <button onClick={handleScan}>Scan SBOM</button>
    </UsageLimitGate>
  );
}
```

#### Checking Subscription Status

```tsx
import { useSubscription } from '../hooks/useSubscription';

function Dashboard() {
  const { tier, isActive, checkFeatureAccess } = useSubscription();

  if (!isActive()) {
    return <SubscriptionExpired />;
  }

  const hasApiAccess = checkFeatureAccess('api_access');
  
  return (
    <div>
      <h1>Welcome {tier} user!</h1>
      {hasApiAccess && <ApiDocs />}
    </div>
  );
}
```

## 📊 Pricing Tiers & Limits

### Free Tier
- 5 vendors max
- 3 SBOM scans/month
- 1 assessment/month
- 1 user
- No API access

### Starter ($49/month)
- 10 vendors
- 10 SBOM scans/month
- 5 assessments/month
- 1 user
- 100 API calls/month
- Email support

### Professional ($149/month)
- 50 vendors
- 50 SBOM scans/month
- 20 assessments/month
- 5 users
- 10,000 API calls/month
- Priority support
- Advanced features

### Enterprise ($449/month)
- Unlimited everything
- SSO/SAML
- Custom integrations
- Dedicated support
- SLA guarantees

## 🔍 Testing

### Test Cards (Development)

Use these Stripe test cards:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Auth:** `4000 0025 0000 3155`

### Testing Checklist

- [ ] Create free account
- [ ] Upgrade to Starter plan
- [ ] Verify subscription activated
- [ ] Check feature access
- [ ] Test usage limits
- [ ] Access billing portal
- [ ] Change payment method
- [ ] Cancel subscription
- [ ] Reactivate subscription
- [ ] Test webhook processing

## 📈 Monitoring

### Key Metrics to Track

1. **Conversion Metrics**
   - Trial starts
   - Trial to paid conversion
   - Upgrade rate
   - Churn rate

2. **Usage Metrics**
   - Feature usage by tier
   - API calls per customer
   - SBOM scans per customer
   - Overage frequency

3. **Revenue Metrics**
   - MRR/ARR
   - ARPU
   - LTV
   - CAC

### Stripe Dashboard

Monitor in Stripe Dashboard:
- Payment success rate
- Failed payments
- Disputes/chargebacks
- Customer retention

## 🐛 Troubleshooting

### Common Issues

#### Checkout Session Not Creating
- Verify Stripe keys are set correctly
- Check Supabase Edge Function logs
- Ensure CORS is configured

#### Webhook Not Processing
- Verify webhook secret is correct
- Check webhook signature validation
- Review Stripe webhook logs
- Ensure Edge Function is deployed

#### Subscription Not Updating
- Check database RLS policies
- Verify service role key in Edge Functions
- Review webhook event handling

#### Usage Limits Not Working
- Check usage_records table
- Verify RPC functions exist
- Test increment_usage function

## 🚀 Going Live Checklist

### Before Launch
- [ ] Switch to Stripe live keys
- [ ] Update webhook endpoints to production URL
- [ ] Test with real credit card (small amount)
- [ ] Configure Stripe tax settings
- [ ] Set up fraud prevention rules
- [ ] Configure email receipts
- [ ] Create refund policy

### After Launch
- [ ] Monitor first transactions
- [ ] Check webhook processing
- [ ] Verify subscription activations
- [ ] Test customer portal access
- [ ] Monitor error rates
- [ ] Set up alerts for failed payments

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)

## 💡 Future Enhancements

Consider adding:
1. Annual billing with discount
2. Team/seat-based pricing
3. Usage-based billing for overages
4. Referral program
5. Promotional codes
6. Multiple payment methods
7. Invoice customization
8. Dunning management
9. Revenue recognition
10. Subscription analytics dashboard

---

**Integration Completed:** December 4, 2024
**Documentation Version:** 1.0.0
**Next Review:** After first 10 customers