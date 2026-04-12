# Renewal Notification Cron Job

This edge function sends renewal reminder emails to customers before their subscriptions renew.

## Policy Requirements

- **Monthly Subscriptions:** Email 7 days before renewal
- **Annual Subscriptions:** Email 30 days before renewal
- **Content:** Renewal date, amount, plan details, cancellation instructions

## How It Works

1. Runs daily (configured via Supabase cron)
2. Queries active subscriptions with upcoming renewals
3. Filters by billing interval (month vs year) using `vs_prices` table
4. Sends email notifications via `send-email-notification` function
5. Tracks sent notifications in subscription metadata to prevent duplicates

## Setup

### 1. Deploy the Function

```bash
supabase functions deploy renewal-notification-cron
```

### 2. Configure Cron Schedule

In Supabase Dashboard:
- Go to **Database** → **Cron Jobs**
- Click **New Cron Job**
- Configure:
  - **Name:** `renewal-notification-cron`
  - **Schedule:** `0 9 * * *` (Daily at 9 AM UTC)
  - **Function:** `renewal-notification-cron`
  - **Enabled:** ✅

### 3. Environment Variables

Ensure these are set in Supabase Dashboard → Settings → Edge Functions:
- `RESEND_API_KEY` - Email service API key
- `SITE_URL` or `APP_URL` - Base URL for email links
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

## Database Requirements

The function requires:
- `vs_subscriptions` table with:
  - `current_period_end` (timestamp)
  - `status` (text)
  - `cancel_at_period_end` (boolean)
  - `price_id` (UUID, references `vs_prices`)
  - `metadata` (JSONB, for tracking sent notifications)
- `vs_prices` table with:
  - `interval` (text: 'month' or 'year')
  - `price_amount` (integer, in cents)
- `vs_profiles` table with:
  - `email` (text)
  - `full_name` (text)

## Email Templates

The function generates HTML emails with:
- Professional styling
- Renewal date and amount
- Plan details
- Link to billing management
- Cancellation instructions

## Testing

### Manual Test

```bash
curl -X POST https://[project].supabase.co/functions/v1/renewal-notification-cron \
  -H "Authorization: Bearer [service-role-key]"
```

### Expected Response

```json
{
  "success": true,
  "timestamp": "2025-01-XX...",
  "results": {
    "monthly7Day": 5,
    "annual30Day": 2,
    "errors": []
  },
  "message": "Processed: 5 monthly 7-day notifications, 2 annual 30-day notifications"
}
```

## Monitoring

Check Supabase Edge Functions logs for:
- Number of notifications sent
- Any errors in email delivery
- Database query issues

## Troubleshooting

### No Notifications Sent

1. Check cron job is enabled and running
2. Verify subscriptions exist with upcoming renewals
3. Check database queries return results
4. Verify email service is configured

### Duplicate Notifications

- Function tracks sent notifications in `metadata.renewal_notification_7days_sent` and `metadata.renewal_notification_30days_sent`
- If duplicates occur, check metadata tracking logic

### Email Delivery Issues

1. Verify `RESEND_API_KEY` is correct
2. Check Resend dashboard for delivery status
3. Verify email addresses are valid
4. Check spam folders

## Related Functions

- `send-email-notification` - Handles actual email sending
- `cancel-subscription` - Handles cancellations
- `stripe-webhook` - Handles Stripe events (including invoice.upcoming)

## Notes

- Stripe's `invoice.upcoming` webhook fires only 1 hour before renewal, so this cron job is necessary for 7/30 day notifications
- The function runs daily, so notifications are sent on the exact day (7 or 30 days before)
- Notifications are only sent for active subscriptions that are not set to cancel
