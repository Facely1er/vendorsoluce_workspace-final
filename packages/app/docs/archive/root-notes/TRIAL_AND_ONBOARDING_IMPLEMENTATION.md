# Trial and Onboarding Implementation Guide

## Overview

This document explains how the trial functionality and onboarding system work in VendorRiskRadar.

## Components Created

### 1. Trial Service (`src/services/trialService.ts`)

Core service for managing trials without requiring credit cards:

- **`startTrial(userId, productId)`** - Creates a 14-day trial subscription directly in the database
- **`isEligibleForTrial(userId)`** - Checks if user can start a trial
- **`getTrialDaysRemaining(userId)`** - Returns days left in trial
- **`convertTrialToPaid(userId, stripeSubscriptionId, stripeCustomerId)`** - Converts trial to paid when user adds payment
- **`cancelTrial(userId)`** - Cancels trial and reverts to free tier

### 2. Trial Start Banner (`src/components/onboarding/TrialStartBanner.tsx`)

Shown during onboarding to let users start their trial:
- Displays trial benefits
- One-click trial start (no credit card required)
- Only shows if user is eligible

### 3. Trial Countdown Banner (`src/components/onboarding/TrialCountdownBanner.tsx`)

Shown on dashboard during trial:
- Shows days remaining
- Color-coded (blue → orange → red as deadline approaches)
- Direct link to upgrade

### 4. Trial Conversion Prompt (`src/components/onboarding/TrialConversionPrompt.tsx`)

Prompts users to convert trial to paid:
- Shows after 7 days of trial
- Dismissible
- Highlights benefits of upgrading

### 5. Onboarding Checklist (`src/components/onboarding/OnboardingChecklist.tsx`)

Guides users through key features:
- Tracks completion of:
  - Adding first vendor
  - Running supply chain assessment
  - Analyzing SBOM
  - Exploring dashboard
- Shows progress bar
- Auto-updates based on user actions

## Integration Points

### Onboarding Flow

1. **New User Signup** → Redirected to `/onboarding`
2. **WelcomeScreen** → Shows trial start banner in "Get Started" step
3. **User Starts Trial** → Trial subscription created in database
4. **Onboarding Complete** → Redirected to dashboard

### Dashboard Integration

The dashboard (`src/pages/DashboardPage.tsx`) includes:
- **Trial Countdown Banner** - Always visible during trial
- **Trial Conversion Prompt** - Shows after 7 days
- **Onboarding Checklist** - Shows for new users who haven't completed key actions

## Database Schema

Trials are stored in `vs_subscriptions` table with:
- `status: 'trialing'`
- `trial_start: timestamp`
- `trial_end: timestamp` (14 days from start)
- `tier: 'professional'` (default for trial)
- `metadata.trial: true`
- `metadata.no_credit_card: true`

## Trial Flow

### Starting a Trial

```typescript
import { TrialService } from '../services/trialService';

// Check eligibility
const eligible = await TrialService.isEligibleForTrial(userId);

// Start trial
if (eligible) {
  await TrialService.startTrial(userId, 'professional-monthly');
}
```

### Converting Trial to Paid

When user adds payment method through Stripe checkout:
1. Stripe webhook creates subscription
2. Call `TrialService.convertTrialToPaid()` to update database
3. Subscription status changes from 'trialing' to 'active'

### Trial Expiration

When trial ends:
1. Subscription status should be updated to 'expired' or 'canceled'
2. User tier reverts to 'free'
3. Consider implementing a cron job or webhook handler

## Usage Examples

### In Onboarding Component

```tsx
import { TrialStartBanner } from '../components/onboarding/TrialStartBanner';

// In your onboarding step
<TrialStartBanner />
```

### In Dashboard

```tsx
import { TrialCountdownBanner } from '../components/onboarding/TrialCountdownBanner';
import { TrialConversionPrompt } from '../components/onboarding/TrialConversionPrompt';
import { OnboardingChecklist } from '../components/onboarding/OnboardingChecklist';

// In your dashboard
<TrialCountdownBanner />
<TrialConversionPrompt showAfterDays={7} />
<OnboardingChecklist />
```

## Next Steps

### 1. Create Supabase Edge Function for Trial Management

Create `supabase/functions/manage-trial/index.ts` to handle:
- Trial expiration checks
- Automatic tier reversion
- Trial-to-paid conversion via webhooks

### 2. Add Email Notifications

Send emails:
- When trial starts
- 3 days before trial ends
- 1 day before trial ends
- When trial expires

### 3. Add Analytics

Track:
- Trial start rate
- Trial completion rate
- Trial-to-paid conversion rate
- Feature usage during trial

### 4. Webhook Handler Updates

Update Stripe webhook handler to:
- Handle trial conversion
- Handle trial expiration
- Update subscription status

## Testing

1. **Test Trial Start**
   - Sign up as new user
   - Go through onboarding
   - Click "Start Free Trial"
   - Verify subscription created with 'trialing' status

2. **Test Trial Countdown**
   - Start trial
   - Check dashboard shows countdown banner
   - Verify days remaining calculation

3. **Test Trial Conversion**
   - Start trial
   - Go to pricing page
   - Add payment method
   - Verify subscription converts to 'active'

4. **Test Trial Expiration**
   - Manually set trial_end to past date
   - Verify user tier reverts to 'free'
   - Verify features are restricted

## Notes

- Trials are created directly in the database (no Stripe subscription initially)
- When user adds payment, trial is converted to Stripe subscription
- Trial gives Professional tier access by default
- Users can only have one trial per account (checked by `isEligibleForTrial`)

