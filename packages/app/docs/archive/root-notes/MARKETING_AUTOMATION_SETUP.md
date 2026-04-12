# Marketing Automation Setup Guide

Complete setup guide for the VendorSoluce marketing automation system.

## ✅ What's Been Created

### 1. Database Schema
- **File**: `supabase/migrations/20250120_marketing_automation.sql`
- **Tables Created**:
  - `vs_marketing_campaigns` - Campaign definitions
  - `vs_email_templates` - Email templates
  - `vs_marketing_workflows` - User journey tracking
  - `vs_email_sends` - Email send tracking
  - `vs_user_events` - Event logging
  - `vs_campaign_analytics` - Performance metrics

### 2. Core Services
- **File**: `src/services/marketingAutomationService.ts`
- **Features**:
  - Workflow management
  - Event logging
  - Email scheduling
  - Campaign analytics

### 3. Email Templates
- **File**: `src/templates/emailTemplates.ts`
- **Templates Included**:
  - Welcome series (5 emails)
  - Abandoned cart
  - Win-back campaign
  - Feature announcements

### 4. Edge Functions
- **Files**:
  - `supabase/functions/process-marketing-workflows/index.ts` - Processes scheduled emails
  - `supabase/functions/schedule-next-email/index.ts` - Schedules next email in sequence

### 5. React Hooks
- **File**: `src/hooks/useMarketingAutomation.ts`
- **Features**:
  - Event tracking
  - Workflow triggers
  - Common event helpers

### 6. Components
- **File**: `src/components/marketing/MarketingEventTracker.tsx`
- **Purpose**: Auto-tracks user events

### 7. Documentation
- `docs/MARKETING_AUTOMATION.md` - Complete system documentation
- `INTEGRATION_EXAMPLE.md` - Integration examples

## 🚀 Quick Setup Steps

### Step 1: Apply Database Migration

```bash
# Option 1: Via Supabase Dashboard
# Go to SQL Editor → New Query → Paste migration file contents → Run

# Option 2: Via CLI
supabase db push
```

### Step 2: Configure Environment Variables

Add to Supabase Edge Function secrets (Dashboard → Settings → Edge Functions):

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=VendorSoluce <noreply@vendorsoluce.com>
SITE_URL=https://vendorsoluce.com
```

### Step 3: Deploy Edge Functions

```bash
# Deploy workflow processor
supabase functions deploy process-marketing-workflows

# Deploy email scheduler
supabase functions deploy schedule-next-email
```

### Step 4: Set Up Cron Job

In Supabase Dashboard → Database → Cron Jobs:

```sql
SELECT cron.schedule(
  'process-marketing-workflows',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/process-marketing-workflows',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

### Step 5: Initialize Default Campaigns

```bash
# Install dependencies if needed
npm install tsx

# Set environment variables
export VITE_SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run initialization
npx tsx scripts/init-marketing-campaigns.ts
```

### Step 6: Integrate Event Tracking

Add to your `App.tsx`:

```typescript
import { MarketingEventTracker } from './components/marketing/MarketingEventTracker';

function App() {
  return (
    <Router>
      <MarketingEventTracker />
      {/* ... rest of your app ... */}
    </Router>
  );
}
```

### Step 7: Trigger Welcome Workflow on Signup

In your signup component:

```typescript
import { useMarketingAutomation } from '../hooks/useMarketingAutomation';

function SignUpPage() {
  const { triggerWelcomeWorkflow } = useMarketingAutomation();
  
  const handleSignup = async () => {
    // ... signup logic ...
    await triggerWelcomeWorkflow();
  };
}
```

## 📊 Default Campaigns Created

### 1. Welcome Series
- **5 emails** over 14 days
- **Trigger**: User signup
- **Purpose**: Onboard new users

### 2. Abandoned Cart
- **1 email** 24 hours after checkout started
- **Trigger**: Checkout started but not completed
- **Purpose**: Convert abandoned checkouts

### 3. Win-Back Campaign
- **1 email** for inactive users
- **Trigger**: 30 days of inactivity
- **Purpose**: Re-engage inactive users

## 🧪 Testing

### Test Email Sending

```typescript
// Manually trigger a workflow for testing
import { MarketingAutomationService } from './services/marketingAutomationService';

const campaigns = await MarketingAutomationService.getActiveCampaigns();
const welcomeCampaign = campaigns.find(c => c.type === 'welcome');

if (welcomeCampaign) {
  await MarketingAutomationService.startWorkflow(
    'your-test-user-id',
    welcomeCampaign.id
  );
}
```

### Check Email Status

```sql
-- View pending emails
SELECT * FROM vs_email_sends 
WHERE status = 'pending' 
ORDER BY scheduled_for ASC;

-- View sent emails
SELECT * FROM vs_email_sends 
WHERE status = 'sent' 
ORDER BY sent_at DESC 
LIMIT 10;
```

## 📈 Monitoring

### View Campaign Performance

```sql
SELECT 
  c.name,
  SUM(ca.emails_sent) as sent,
  SUM(ca.emails_opened) as opened,
  SUM(ca.emails_clicked) as clicked,
  ROUND(SUM(ca.emails_opened)::numeric / NULLIF(SUM(ca.emails_sent), 0) * 100, 2) as open_rate
FROM vs_campaign_analytics ca
JOIN vs_marketing_campaigns c ON c.id = ca.campaign_id
GROUP BY c.id, c.name
ORDER BY sent DESC;
```

### View Active Workflows

```sql
SELECT 
  p.email,
  c.name as campaign,
  w.status,
  w.current_step,
  w.started_at
FROM vs_marketing_workflows w
JOIN vs_profiles p ON p.id = w.user_id
JOIN vs_marketing_campaigns c ON c.id = w.campaign_id
WHERE w.status = 'active'
ORDER BY w.started_at DESC;
```

## 🔧 Troubleshooting

### Emails Not Sending

1. **Check Resend API Key**: Verify it's set in Edge Function secrets
2. **Check Cron Job**: Verify it's running (check Supabase logs)
3. **Check Email Status**: Query `vs_email_sends` for error messages
4. **Check Edge Function Logs**: View logs in Supabase Dashboard

### Workflows Not Triggering

1. **Check Events**: Query `vs_user_events` to see if events are logged
2. **Check Campaign Status**: Ensure campaign `status = 'active'`
3. **Check Trigger Config**: Verify `trigger_config` matches event type
4. **Check Conditions**: Verify user meets campaign conditions

### Template Variables Not Replacing

Templates use `{{variable}}` syntax. Check:
- Variables are spelled correctly
- Edge function replaces variables (see `process-marketing-workflows`)
- User data exists in `vs_profiles` table

## 📝 Next Steps

1. **Customize Templates**: Edit email templates in `vs_email_templates` table
2. **Create Custom Campaigns**: Add campaigns for your specific use cases
3. **Set Up Webhooks**: Configure Resend webhooks for open/click tracking
4. **Monitor Performance**: Set up dashboards for campaign metrics
5. **A/B Testing**: Test different subject lines and content

## 🎯 Common Use Cases

### Add Trial Expiration Campaign

```sql
-- Create campaign
INSERT INTO vs_marketing_campaigns (
  name, type, trigger_type, trigger_config, status
) VALUES (
  'Trial Expiring',
  'trial',
  'event',
  '{"event_type": "trial_expiring"}'::jsonb,
  'active'
);

-- Add templates (3 days before, 1 day before)
INSERT INTO vs_email_templates (
  campaign_id, name, subject, html_content, delay_days, sequence_order
) VALUES (
  'campaign-id',
  'Trial Expiring - 3 Days',
  'Your Trial Ends in 3 Days',
  '<html>...</html>',
  0,
  1
);
```

### Track Feature Usage

```typescript
const { events } = useMarketingAutomation();

// When user uses a feature
events.featureUsed('sbom_analyzer');
events.featureUsed('vendor_assessment');
events.featureUsed('risk_dashboard');
```

## 📚 Additional Resources

- **Full Documentation**: See `docs/MARKETING_AUTOMATION.md`
- **Integration Examples**: See `INTEGRATION_EXAMPLE.md`
- **Resend API Docs**: https://resend.com/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

## ✅ Checklist

- [ ] Database migration applied
- [ ] Environment variables configured
- [ ] Edge functions deployed
- [ ] Cron job set up
- [ ] Default campaigns initialized
- [ ] Event tracking integrated
- [ ] Welcome workflow tested
- [ ] Email delivery verified
- [ ] Campaign analytics monitored

## 🆘 Support

If you encounter issues:
1. Check Edge Function logs in Supabase Dashboard
2. Review `vs_email_sends` table for error messages
3. Verify all environment variables are set
4. Check Resend dashboard for delivery status
5. Contact support@vendorsoluce.com

---

**Setup completed!** Your marketing automation system is ready to use. 🎉

