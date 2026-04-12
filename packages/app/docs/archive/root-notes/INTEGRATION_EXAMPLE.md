# Marketing Automation Integration Examples

Quick examples for integrating marketing automation into your application.

## 1. Add Event Tracker to App

In your `App.tsx` or main layout:

```typescript
import { MarketingEventTracker } from './components/marketing/MarketingEventTracker';

function App() {
  return (
    <Router>
      <MarketingEventTracker /> {/* Add this */}
      <Routes>
        {/* ... your routes ... */}
      </Routes>
    </Router>
  );
}
```

## 2. Trigger Welcome Workflow on Signup

In your signup component:

```typescript
import { useMarketingAutomation } from '../hooks/useMarketingAutomation';

function SignUpPage() {
  const { triggerWelcomeWorkflow, events } = useMarketingAutomation();
  
  const handleSignup = async (email: string, password: string) => {
    // ... your signup logic ...
    const { data: user } = await supabase.auth.signUp({ email, password });
    
    if (user?.user) {
      // Trigger welcome workflow
      await triggerWelcomeWorkflow();
      
      // Or log signup event (will auto-trigger campaigns)
      events.signup();
    }
  };
  
  return (
    // ... your signup form ...
  );
}
```

## 3. Track First-Time Actions

```typescript
import { useMarketingAutomation } from '../hooks/useMarketingAutomation';
import { useEffect, useState } from 'react';

function VendorManagementPage() {
  const { events } = useMarketingAutomation();
  const [hasAddedVendor, setHasAddedVendor] = useState(false);
  
  const handleAddVendor = async (vendorData: any) => {
    // ... add vendor logic ...
    
    // Track first vendor added
    if (!hasAddedVendor) {
      events.firstVendorAdded();
      setHasAddedVendor(true);
    }
  };
  
  return (
    // ... your component ...
  );
}
```

## 4. Track Checkout Abandonment

```typescript
import { useMarketingAutomation } from '../hooks/useMarketingAutomation';

function CheckoutPage() {
  const { events } = useMarketingAutomation();
  
  useEffect(() => {
    // Track when user visits checkout
    events.checkoutStarted();
  }, []);
  
  const handleCompleteCheckout = async () => {
    // ... checkout logic ...
    events.subscriptionCreated(planId, amount);
  };
  
  return (
    // ... checkout form ...
  );
}
```

## 5. Track Trial Events

```typescript
import { useMarketingAutomation } from '../hooks/useMarketingAutomation';
import { TrialService } from '../services/trialService';

function TrialStartPage() {
  const { events } = useMarketingAutomation();
  
  const handleStartTrial = async () => {
    await TrialService.startTrial(userId);
    events.trialStarted();
  };
  
  // Track trial expiration warnings
  useEffect(() => {
    const checkTrialStatus = async () => {
      const daysRemaining = await TrialService.getTrialDaysRemaining(userId);
      if (daysRemaining <= 3 && daysRemaining > 0) {
        events.trialExpiring(daysRemaining);
      }
    };
    
    checkTrialStatus();
    const interval = setInterval(checkTrialStatus, 24 * 60 * 60 * 1000); // Daily
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    // ... your component ...
  );
}
```

## 6. Track Usage Limits

```typescript
import { useMarketingAutomation } from '../hooks/useMarketingAutomation';
import { useUsageLimit } from '../hooks/useUsageLimit';

function SBOMAnalyzerPage() {
  const { events } = useMarketingAutomation();
  const { canUse, used, limit } = useUsageLimit('sbom_scans');
  
  const handleAnalyzeSBOM = async (file: File) => {
    if (!canUse) {
      // Track when limit is reached
      events.usageLimitReached('sbom_scans');
      // Show upgrade prompt
      return;
    }
    
    // ... analyze SBOM ...
  };
  
  return (
    // ... your component ...
  );
}
```

## 7. Track Inactive Users

Add this to a background job or cron:

```typescript
// scripts/check-inactive-users.ts
import { supabase } from '../lib/supabase';
import { MarketingAutomationService } from '../services/marketingAutomationService';

async function checkInactiveUsers() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Find users who haven't logged in for 30 days
  const { data: inactiveUsers } = await supabase
    .from('vs_profiles')
    .select('id, last_login_at')
    .lt('last_login_at', thirtyDaysAgo.toISOString())
    .eq('subscription_tier', 'free'); // Only free tier users
  
  for (const user of inactiveUsers || []) {
    const daysInactive = Math.floor(
      (Date.now() - new Date(user.last_login_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    await MarketingAutomationService.logUserEvent(
      user.id,
      'user_inactive',
      { days_inactive: daysInactive }
    );
  }
}
```

## 8. Manual Campaign Trigger

```typescript
import { MarketingAutomationService } from '../services/marketingAutomationService';

// Trigger a campaign manually for a user
async function sendFeatureAnnouncement(userId: string) {
  const campaigns = await MarketingAutomationService.getActiveCampaigns();
  const featureCampaign = campaigns.find(c => c.type === 'feature_announcement');
  
  if (featureCampaign) {
    await MarketingAutomationService.startWorkflow(
      userId,
      featureCampaign.id,
      { manual_trigger: true }
    );
  }
}
```

## 9. Track Onboarding Completion

```typescript
import { useMarketingAutomation } from '../hooks/useMarketingAutomation';
import { useOnboarding } from '../hooks/useOnboarding';

function OnboardingPage() {
  const { events } = useMarketingAutomation();
  const { completeOnboarding } = useOnboarding();
  
  const handleComplete = async () => {
    await completeOnboarding();
    events.onboardingComplete();
  };
  
  return (
    // ... onboarding UI ...
  );
}
```

## 10. Email Webhook Handler (Resend)

Set up webhook in Resend dashboard to track opens/clicks:

```typescript
// supabase/functions/email-webhook/index.ts
serve(async (req) => {
  const event = await req.json();
  
  // Find email send by provider ID
  const { data: emailSend } = await supabase
    .from('vs_email_sends')
    .select('id')
    .eq('email_provider_id', event.data.email_id)
    .single();
  
  if (emailSend) {
    if (event.type === 'email.opened') {
      await MarketingAutomationService.updateEmailStatus(
        emailSend.id,
        'opened'
      );
    } else if (event.type === 'email.clicked') {
      await MarketingAutomationService.updateEmailStatus(
        emailSend.id,
        'clicked'
      );
    }
  }
  
  return new Response(JSON.stringify({ received: true }));
});
```

## Best Practices

1. **Track Early**: Add event tracking as you build features
2. **Be Consistent**: Use the same event names across your app
3. **Don't Over-Track**: Only track meaningful user actions
4. **Test**: Test campaigns with test users before going live
5. **Monitor**: Check campaign performance regularly
6. **Respect Privacy**: Only track necessary events, respect user preferences

## Common Event Types

- `user_signup` - New user registration
- `user_login` - User logs in
- `onboarding_complete` - User completes onboarding
- `first_vendor_added` - User adds first vendor
- `first_assessment_completed` - User completes first assessment
- `first_sbom_analyzed` - User analyzes first SBOM
- `dashboard_viewed` - User views dashboard
- `feature_used` - User uses a specific feature
- `checkout_started` - User starts checkout process
- `subscription_created` - User subscribes to a plan
- `trial_started` - User starts free trial
- `trial_expiring` - Trial is about to expire
- `usage_limit_reached` - User hits usage limit
- `user_inactive` - User hasn't been active for X days

