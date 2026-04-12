# Marketing Automation System

Complete guide to the VendorSoluce marketing automation system.

## Overview

The marketing automation system enables automated email campaigns, user journey tracking, and engagement workflows. It's built on Supabase Edge Functions and integrates with Resend for email delivery.

## Architecture

### Components

1. **Database Schema** (`vs_marketing_campaigns`, `vs_email_templates`, `vs_marketing_workflows`, `vs_email_sends`)
2. **Marketing Automation Service** (`src/services/marketingAutomationService.ts`)
3. **Email Templates** (`src/templates/emailTemplates.ts`)
4. **Edge Functions** (process workflows, schedule emails)
5. **React Hooks** (`useMarketingAutomation`)

## Setup

### 1. Run Database Migration

```bash
# Apply the marketing automation migration
psql -h your-db-host -U postgres -d vendorsoluce -f supabase/migrations/20250120_marketing_automation.sql
```

Or use Supabase Dashboard → SQL Editor and paste the migration file contents.

### 2. Initialize Default Campaigns

```bash
# Set environment variables
export VITE_SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run initialization script
npx tsx scripts/init-marketing-campaigns.ts
```

This creates:
- Welcome Series (5 emails)
- Abandoned Cart Campaign
- Win-Back Campaign

### 3. Configure Environment Variables

Add to your `.env` or Supabase Edge Function secrets:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=VendorSoluce <noreply@vendorsoluce.com>
SITE_URL=https://vendorsoluce.com
```

### 4. Deploy Edge Functions

```bash
# Deploy workflow processor (runs every hour via cron)
supabase functions deploy process-marketing-workflows

# Deploy next email scheduler
supabase functions deploy schedule-next-email
```

### 5. Set Up Cron Job

In Supabase Dashboard → Database → Cron Jobs, create:

```sql
-- Run every hour to process scheduled emails
SELECT cron.schedule(
  'process-marketing-workflows',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/process-marketing-workflows',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

## Usage

### Triggering Workflows

#### In React Components

```typescript
import { useMarketingAutomation } from '../hooks/useMarketingAutomation';

function SignUpPage() {
  const { events, triggerWelcomeWorkflow } = useMarketingAutomation();

  const handleSignup = async () => {
    // ... signup logic ...
    
    // Trigger welcome workflow
    await triggerWelcomeWorkflow();
    
    // Or log event (will auto-trigger campaigns)
    events.signup();
  };
}
```

#### Common Events

```typescript
const { events } = useMarketingAutomation();

// User lifecycle
events.signup();
events.login();
events.onboardingComplete();

// Product usage
events.firstVendorAdded();
events.firstAssessmentCompleted();
events.firstSBOMAnalyzed();

// Conversion
events.checkoutStarted('professional-monthly');
events.subscriptionCreated('professional-monthly', 12900);
events.trialStarted();
events.trialExpiring(3);

// Churn risk
events.usageLimitReached('sbom_scans');
events.inactiveUser(30);
```

### Creating Custom Campaigns

#### Via Supabase Dashboard

1. Go to `vs_marketing_campaigns` table
2. Insert new campaign:

```sql
INSERT INTO vs_marketing_campaigns (
  name,
  description,
  type,
  trigger_type,
  trigger_config,
  status
) VALUES (
  'Feature Announcement',
  'Announce new SBOM features',
  'feature_announcement',
  'event',
  '{"event_type": "feature_released"}'::jsonb,
  'active'
);
```

3. Add email templates:

```sql
INSERT INTO vs_email_templates (
  campaign_id,
  name,
  subject,
  html_content,
  delay_days,
  delay_hours,
  sequence_order,
  is_active
) VALUES (
  'campaign-uuid',
  'Feature Announcement Email',
  'New Feature: Enhanced SBOM Analysis',
  '<html>...</html>',
  0,
  0,
  1,
  true
);
```

#### Programmatically

```typescript
import { MarketingAutomationService } from '../services/marketingAutomationService';

// Create campaign
const campaign = await supabase
  .from('vs_marketing_campaigns')
  .insert({
    name: 'Custom Campaign',
    type: 'custom',
    trigger_type: 'event',
    trigger_config: { event_type: 'custom_event' },
    status: 'active',
  })
  .select()
  .single();

// Add templates
await supabase
  .from('vs_email_templates')
  .insert({
    campaign_id: campaign.id,
    name: 'Email 1',
    subject: 'Subject',
    html_content: '<html>...</html>',
    sequence_order: 1,
  });
```

## Campaign Types

### Welcome Series
- **Trigger**: `user_signup` event
- **Emails**: 5 emails over 14 days
- **Purpose**: Onboard new users

### Abandoned Cart
- **Trigger**: `checkout_started` event (no completion)
- **Emails**: 1 reminder after 24 hours
- **Purpose**: Convert started checkouts

### Win-Back
- **Trigger**: `user_inactive` event (30+ days)
- **Emails**: 1 re-engagement email
- **Purpose**: Reactivate inactive users

### Trial Expiring
- **Trigger**: `trial_expiring` event
- **Emails**: 2 emails (3 days before, 1 day before)
- **Purpose**: Convert trials to paid

### Feature Announcement
- **Trigger**: Manual or `feature_released` event
- **Emails**: 1 announcement email
- **Purpose**: Announce new features

## Email Templates

Templates support variables:
- `{{name}}` - User's full name
- `{{email}}` - User's email
- `{{dashboardUrl}}` - Dashboard URL
- `{{pricingUrl}}` - Pricing page URL
- `{{baseUrl}}` - Site base URL

## Monitoring & Analytics

### View Campaign Performance

```sql
SELECT 
  c.name,
  c.type,
  SUM(ca.emails_sent) as total_sent,
  SUM(ca.emails_opened) as total_opened,
  SUM(ca.emails_clicked) as total_clicked,
  ROUND(SUM(ca.emails_opened)::numeric / NULLIF(SUM(ca.emails_sent), 0) * 100, 2) as open_rate,
  ROUND(SUM(ca.emails_clicked)::numeric / NULLIF(SUM(ca.emails_sent), 0) * 100, 2) as click_rate
FROM vs_campaign_analytics ca
JOIN vs_marketing_campaigns c ON c.id = ca.campaign_id
GROUP BY c.id, c.name, c.type
ORDER BY total_sent DESC;
```

### View User Workflows

```sql
SELECT 
  w.id,
  p.email,
  c.name as campaign_name,
  w.status,
  w.current_step,
  w.started_at
FROM vs_marketing_workflows w
JOIN vs_profiles p ON p.id = w.user_id
JOIN vs_marketing_campaigns c ON c.id = w.campaign_id
WHERE w.status = 'active'
ORDER BY w.started_at DESC;
```

### View Pending Emails

```sql
SELECT 
  es.id,
  p.email,
  es.subject,
  es.scheduled_for,
  es.status
FROM vs_email_sends es
JOIN vs_profiles p ON p.id = es.user_id
WHERE es.status = 'pending'
ORDER BY es.scheduled_for ASC;
```

## Best Practices

1. **Test Campaigns**: Always test campaigns with a test user before activating
2. **Monitor Performance**: Check open/click rates weekly
3. **Segment Users**: Use conditions to target specific user segments
4. **Respect Unsubscribes**: Honor unsubscribe requests immediately
5. **A/B Testing**: Test subject lines and content variations
6. **Timing**: Schedule emails during business hours for better engagement

## Troubleshooting

### Emails Not Sending

1. Check Resend API key is configured
2. Verify cron job is running
3. Check `vs_email_sends` table for error messages
4. Review Edge Function logs in Supabase Dashboard

### Workflows Not Triggering

1. Verify event is being logged (`vs_user_events` table)
2. Check campaign `trigger_config` matches event type
3. Ensure campaign status is 'active'
4. Check user conditions (subscription tier, etc.)

### Template Variables Not Replacing

Templates use `{{variable}}` syntax. Ensure:
- Variables are spelled correctly
- Edge function replaces variables (see `process-marketing-workflows`)
- User data exists in `vs_profiles` table

## API Reference

### MarketingAutomationService

```typescript
// Start workflow
await MarketingAutomationService.startWorkflow(userId, campaignId);

// Log event
await MarketingAutomationService.logUserEvent(userId, 'event_type', { data });

// Get active campaigns
const campaigns = await MarketingAutomationService.getActiveCampaigns();

// Get user workflows
const workflows = await MarketingAutomationService.getUserWorkflows(userId);

// Cancel workflow
await MarketingAutomationService.cancelWorkflow(workflowId);
```

## Support

For issues or questions:
- Check Edge Function logs in Supabase Dashboard
- Review `vs_email_sends` table for error details
- Contact support@vendorsoluce.com

