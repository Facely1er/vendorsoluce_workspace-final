# VendorSoluce Monetization Quick Start Guide

## 🚨 CRITICAL PATH TO REVENUE - 2 Week Sprint

### Prerequisites Setup (Day 1)
- [ ] Create Stripe account at https://stripe.com
- [ ] Get Stripe API keys (test and production)
- [ ] Set up Stripe webhook endpoint
- [ ] Create Stripe products and pricing in dashboard
- [ ] Install Stripe CLI for local testing

### Week 1: Core Payment Infrastructure

#### Day 1-2: Database Schema
```sql
-- Add to Supabase migrations
CREATE TABLE vs_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES vs_profiles(id),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vs_usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES vs_profiles(id),
  feature TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vs_payment_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES vs_profiles(id),
  stripe_payment_intent_id TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Day 3-4: Stripe Integration
```bash
# Install dependencies
npm install stripe @stripe/stripe-js
```

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// src/lib/stripe-client.ts
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.VITE_STRIPE_PUBLISHABLE_KEY!
);
```

#### Day 5: Checkout Implementation
```typescript
// src/components/checkout/CheckoutButton.tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function CheckoutButton({ planId, price }: { planId: string; price: number }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCheckout = async () => {
    setLoading(true);
    
    // Call Supabase Edge Function to create Stripe session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.access_token}`
      },
      body: JSON.stringify({ planId, price })
    });

    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Loading...' : `Subscribe - $${price}/month`}
    </button>
  );
}
```

### Week 2: Feature Gating & Usage Tracking

#### Day 6-7: Plan Limits & Feature Gating
```typescript
// src/utils/planLimits.ts
export const PLAN_LIMITS = {
  free: {
    sbom_scans: 3,
    vendors: 5,
    assessments: 1,
    users: 1,
    api_calls: 0,
    features: ['basic_dashboard', 'basic_sbom']
  },
  starter: {
    sbom_scans: 10,
    vendors: 10,
    assessments: 5,
    users: 1,
    api_calls: 100,
    features: ['basic_dashboard', 'basic_sbom', 'vendor_management', 'pdf_export']
  },
  professional: {
    sbom_scans: 50,
    vendors: 50,
    assessments: 20,
    users: 5,
    api_calls: 10000,
    features: ['all_starter', 'api_access', 'advanced_analytics', 'threat_intel']
  },
  enterprise: {
    sbom_scans: -1, // unlimited
    vendors: -1,
    assessments: -1,
    users: -1,
    api_calls: -1,
    features: ['all_features']
  }
};

// src/hooks/useFeatureAccess.ts
export function useFeatureAccess(feature: string): boolean {
  const { profile } = useAuth();
  const userPlan = profile?.subscription_plan || 'free';
  const limits = PLAN_LIMITS[userPlan];
  
  return limits.features.includes(feature) || limits.features.includes('all_features');
}

// src/hooks/useUsageLimit.ts
export function useUsageLimit(feature: string): { used: number; limit: number; canUse: boolean } {
  const { profile } = useAuth();
  const userPlan = profile?.subscription_plan || 'free';
  const limits = PLAN_LIMITS[userPlan];
  
  // Fetch current usage from database
  const { data: usage } = useQuery(['usage', feature], fetchUsage);
  
  const limit = limits[feature] || 0;
  const used = usage?.count || 0;
  const canUse = limit === -1 || used < limit;
  
  return { used, limit, canUse };
}
```

#### Day 8-9: Usage Tracking Implementation
```typescript
// src/utils/trackUsage.ts
export async function trackUsage(feature: string, count: number = 1) {
  const { user } = await supabase.auth.getUser();
  
  if (!user) return;
  
  // Update usage count
  const { error } = await supabase.rpc('increment_usage', {
    user_id: user.id,
    feature_name: feature,
    increment_by: count
  });
  
  if (error) console.error('Usage tracking error:', error);
  
  // Check if limit exceeded
  const { data: usage } = await supabase
    .from('vs_usage_tracking')
    .select('count')
    .eq('user_id', user.id)
    .eq('feature', feature)
    .single();
    
  const plan = await getUserPlan(user.id);
  const limit = PLAN_LIMITS[plan][feature];
  
  if (limit !== -1 && usage.count >= limit) {
    // Show upgrade prompt
    showUpgradeModal(feature);
  }
}

// Usage in components
const handleSBOMScan = async (file: File) => {
  const { canUse } = useUsageLimit('sbom_scans');
  
  if (!canUse) {
    showUpgradeModal('sbom_scans');
    return;
  }
  
  // Perform scan
  await scanSBOM(file);
  
  // Track usage
  await trackUsage('sbom_scans');
};
```

#### Day 10: Upgrade Flows
```typescript
// src/components/upgrade/UpgradeModal.tsx
export function UpgradeModal({ feature, currentPlan }: Props) {
  const suggestedPlan = getSuggestedPlan(feature, currentPlan);
  
  return (
    <Modal>
      <h2>Upgrade to Continue</h2>
      <p>You've reached the limit for {feature} on your {currentPlan} plan.</p>
      <p>Upgrade to {suggestedPlan} to get:</p>
      <ul>
        <li>{PLAN_LIMITS[suggestedPlan][feature]} {feature}/month</li>
        <li>Advanced features</li>
        <li>Priority support</li>
      </ul>
      <CheckoutButton planId={suggestedPlan} price={PLAN_PRICES[suggestedPlan]} />
    </Modal>
  );
}
```

### Testing Checklist

#### Payment Flow Testing
- [ ] Test successful payment with Stripe test cards
- [ ] Test failed payment scenarios
- [ ] Test subscription creation
- [ ] Test subscription cancellation
- [ ] Test plan upgrades/downgrades
- [ ] Test webhook handling
- [ ] Test invoice generation

#### Feature Gating Testing
- [ ] Test free tier limits
- [ ] Test starter tier limits
- [ ] Test professional tier limits
- [ ] Test upgrade prompts
- [ ] Test feature access control
- [ ] Test usage tracking accuracy

#### Edge Cases
- [ ] Test expired cards
- [ ] Test payment retries
- [ ] Test proration on plan changes
- [ ] Test grace period handling
- [ ] Test concurrent usage tracking
- [ ] Test timezone handling for usage resets

### Environment Variables Required
```bash
# .env.local
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_APP_URL=http://localhost:5173

# .env.production
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_APP_URL=https://vendorsoluce.com
```

### Supabase Edge Functions

Create these edge functions for secure payment processing:

```typescript
// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const { planId, price } = await req.json()
  const authHeader = req.headers.get('Authorization')
  
  // Verify user authentication
  const user = await verifyUser(authHeader)
  
  // Create or get Stripe customer
  const customer = await getOrCreateStripeCustomer(user)
  
  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `VendorSoluce ${planId} Plan`,
        },
        unit_amount: price * 100,
        recurring: {
          interval: 'month',
        },
      },
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${Deno.env.get('APP_URL')}/dashboard?success=true`,
    cancel_url: `${Deno.env.get('APP_URL')}/pricing`,
  })
  
  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Monitoring & Analytics

#### Key Metrics to Track
```typescript
// Track these events in Mixpanel/Amplitude
analytics.track('checkout_started', {
  plan: planId,
  price: price,
  user_id: user.id
});

analytics.track('payment_completed', {
  plan: planId,
  amount: amount,
  user_id: user.id
});

analytics.track('subscription_cancelled', {
  plan: planId,
  reason: cancellationReason,
  user_id: user.id
});

analytics.track('usage_limit_reached', {
  feature: feature,
  plan: currentPlan,
  usage: currentUsage
});

analytics.track('upgrade_prompt_shown', {
  trigger: feature,
  current_plan: currentPlan,
  suggested_plan: suggestedPlan
});
```

### Go-Live Checklist

#### Pre-Launch (Day 13)
- [ ] Stripe account verified and activated
- [ ] Production API keys configured
- [ ] Webhook endpoints configured and tested
- [ ] SSL certificate active
- [ ] Database migrations run in production
- [ ] Environment variables set in production
- [ ] Edge functions deployed

#### Launch Day (Day 14)
- [ ] Enable payment processing in production
- [ ] Test with real credit card (small amount)
- [ ] Monitor Stripe dashboard for issues
- [ ] Monitor error logs
- [ ] Test customer support flow
- [ ] Announce to beta users

#### Post-Launch (Day 15+)
- [ ] Monitor conversion rates
- [ ] Track failed payments
- [ ] Analyze upgrade triggers
- [ ] Optimize checkout flow
- [ ] A/B test pricing
- [ ] Gather user feedback

## 🎯 Expected Outcomes

### Week 1 Deliverables
- ✅ Stripe integration complete
- ✅ Payment processing functional
- ✅ Subscription management working
- ✅ Database schema updated

### Week 2 Deliverables
- ✅ Feature gating implemented
- ✅ Usage tracking active
- ✅ Upgrade flows working
- ✅ Production deployment ready

### Success Metrics (First 30 Days)
- 100+ free tier signups
- 20+ trial starts
- 5+ paying customers
- $500+ MRR
- <5% payment failure rate
- <10% churn rate

## 🚀 Next Steps After MVP

1. **Optimize Conversion** (Week 3)
   - A/B test pricing
   - Optimize checkout flow
   - Add testimonials
   - Implement urgency tactics

2. **Add Advanced Features** (Week 4)
   - Annual billing discount
   - Team billing
   - Usage-based add-ons
   - Referral program

3. **Scale Operations** (Month 2)
   - Customer success automation
   - Dunning management
   - Revenue recognition
   - Advanced analytics

---

**Quick Start Guide Generated:** October 4, 2025
**Estimated Implementation Time:** 2 weeks
**Estimated Cost:** $10,000 - $15,000
**Expected ROI:** Positive within 3 months