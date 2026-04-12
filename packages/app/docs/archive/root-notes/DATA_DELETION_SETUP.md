# Data Deletion Workflow Setup Guide

**Date:** January 2025  
**Status:** Implementation Complete

## Overview

This document describes the data deletion workflow implementation that enforces the e-commerce policy requirements for grace periods and automatic data deletion after cancellation.

---

## Implementation Components

### 1. Database Migration

**File:** `supabase/migrations/20250115_add_grace_period_tracking.sql`

**Changes:**
- Adds `grace_period_start` timestamp
- Adds `grace_period_end` timestamp
- Adds `data_deleted_at` timestamp
- Adds `is_read_only` boolean flag
- Creates indexes for efficient queries

**To Apply:**
```bash
# Run migration in Supabase SQL Editor or via CLI
supabase migration up
```

---

### 2. Edge Functions

#### `manage-data-deletion`
**Purpose:** Deletes user data after grace period expires

**Location:** `supabase/functions/manage-data-deletion/index.ts`

**What it does:**
- Finds subscriptions with expired grace periods
- Deletes user data from all tables:
  - `vs_vendor_assessments`
  - `vs_sbom_analyses`
  - `vs_vendors`
  - `vs_usage_records`
- Marks subscription as deleted
- Returns summary of deleted accounts

**Deploy:**
```bash
supabase functions deploy manage-data-deletion
```

#### `check-grace-periods`
**Purpose:** Sets accounts to read-only mode when grace period starts

**Location:** `supabase/functions/check-grace-periods/index.ts`

**What it does:**
- Finds cancelled subscriptions past their period end
- Sets `is_read_only = true` for accounts in grace period
- Should run daily to catch accounts entering grace period

**Deploy:**
```bash
supabase functions deploy check-grace-periods
```

---

### 3. Updated Functions

#### `cancel-subscription`
**Updated:** Now sets grace period dates when subscription is cancelled

**Changes:**
- Calculates grace period based on subscription type:
  - 30 days for paid accounts
  - 7 days for free trials
- Sets `grace_period_start` and `grace_period_end`
- Updates cancellation email to reflect correct grace period

---

### 4. Frontend Updates

#### `useSubscription` Hook
**Updated:** `src/hooks/useSubscription.ts`

**New Methods:**
- `isReadOnly()`: Checks if account is in read-only mode
- `daysUntilDataDeletion()`: Returns days remaining in grace period

**Usage:**
```typescript
const { isReadOnly, daysUntilDataDeletion } = useSubscription();

if (isReadOnly()) {
  // Show read-only banner
  // Disable write operations
  // Show data export options
}
```

#### Read-Only Utility
**New File:** `src/utils/readOnlyCheck.ts`

**Functions:**
- `checkReadOnlyStatus(userId)`: Returns read-only status with details
- `assertWriteAccess(userId)`: Throws error if in read-only mode

**Usage:**
```typescript
import { assertWriteAccess, checkReadOnlyStatus } from '../utils/readOnlyCheck';

// Before write operations
try {
  await assertWriteAccess(user.id);
  // Proceed with write operation
} catch (error) {
  // Show error message to user
}
```

---

## Scheduled Jobs Setup

### Option 1: Supabase Cron Jobs (Recommended)

Supabase supports pg_cron extension for scheduled jobs. Add these to your database:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily grace period check (runs at 2 AM UTC)
SELECT cron.schedule(
  'check-grace-periods-daily',
  '0 2 * * *', -- Daily at 2 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://[your-project].supabase.co/functions/v1/check-grace-periods',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [service-role-key]"}',
    body := '{}'
  );
  $$
);

-- Schedule daily data deletion (runs at 3 AM UTC)
SELECT cron.schedule(
  'manage-data-deletion-daily',
  '0 3 * * *', -- Daily at 3 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://[your-project].supabase.co/functions/v1/manage-data-deletion',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [service-role-key]"}',
    body := '{}'
  );
  $$
);
```

**Note:** Replace `[your-project]` and `[service-role-key]` with your actual values.

### Option 2: External Cron Service

Use an external service like:
- **GitHub Actions** (with scheduled workflows)
- **Vercel Cron** (if using Vercel)
- **AWS EventBridge** (if using AWS)
- **Google Cloud Scheduler** (if using GCP)

**Example GitHub Actions workflow:**

```yaml
# .github/workflows/data-deletion.yml
name: Data Deletion Workflow

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC
  workflow_dispatch: # Allow manual trigger

jobs:
  check-grace-periods:
    runs-on: ubuntu-latest
    steps:
      - name: Check Grace Periods
        run: |
          curl -X POST https://[your-project].supabase.co/functions/v1/check-grace-periods \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
  
  manage-data-deletion:
    runs-on: ubuntu-latest
    steps:
      - name: Manage Data Deletion
        run: |
          curl -X POST https://[your-project].supabase.co/functions/v1/manage-data-deletion \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

### Option 3: Manual Trigger (Testing)

For testing, you can manually trigger the functions:

```bash
# Check grace periods
curl -X POST https://[your-project].supabase.co/functions/v1/check-grace-periods \
  -H "Authorization: Bearer [service-role-key]"

# Manage data deletion
curl -X POST https://[your-project].supabase.co/functions/v1/manage-data-deletion \
  -H "Authorization: Bearer [service-role-key]"
```

---

## Testing the Workflow

### 1. Test Grace Period Setup

1. Create a test subscription
2. Cancel the subscription
3. Verify grace period dates are set:
   ```sql
   SELECT 
     id, 
     cancel_at_period_end, 
     current_period_end, 
     grace_period_start, 
     grace_period_end,
     is_read_only
   FROM vs_subscriptions
   WHERE user_id = '[test-user-id]';
   ```

### 2. Test Read-Only Mode

1. Manually set `current_period_end` to a past date
2. Call `check-grace-periods` function
3. Verify `is_read_only` is set to `true`
4. Test that write operations are blocked

### 3. Test Data Deletion

1. Set `grace_period_end` to a past date
2. Call `manage-data-deletion` function
3. Verify user data is deleted
4. Verify `data_deleted_at` is set

---

## Policy Compliance

### Grace Period Requirements ✅

- **Paid Accounts:** 30-day grace period ✅
- **Free Trials:** 7-day grace period ✅
- **Read-Only Access:** During grace period ✅
- **Data Export:** Available during grace period ✅

### Data Deletion Requirements ✅

- **Automatic Deletion:** After grace period ✅
- **Permanent Deletion:** All user data removed ✅
- **Deletion Tracking:** `data_deleted_at` timestamp ✅

---

## Monitoring

### Key Metrics to Track

1. **Grace Period Status:**
   ```sql
   SELECT 
     COUNT(*) as total_cancelled,
     COUNT(*) FILTER (WHERE is_read_only = true) as in_read_only,
     COUNT(*) FILTER (WHERE grace_period_end < NOW()) as expired_grace_periods
   FROM vs_subscriptions
   WHERE cancel_at_period_end = true;
   ```

2. **Data Deletion Status:**
   ```sql
   SELECT 
     COUNT(*) as total_deleted,
     AVG(EXTRACT(EPOCH FROM (data_deleted_at - grace_period_end))/86400) as avg_days_after_grace
   FROM vs_subscriptions
   WHERE data_deleted_at IS NOT NULL;
   ```

3. **Grace Period Distribution:**
   ```sql
   SELECT 
     tier,
     COUNT(*) as count,
     AVG(EXTRACT(EPOCH FROM (grace_period_end - grace_period_start))/86400) as avg_grace_days
   FROM vs_subscriptions
   WHERE grace_period_start IS NOT NULL
   GROUP BY tier;
   ```

---

## Troubleshooting

### Issue: Grace periods not being set

**Check:**
- Verify `cancel-subscription` function is being called
- Check subscription cancellation flow
- Verify database migration was applied

### Issue: Read-only mode not activating

**Check:**
- Verify `check-grace-periods` function is running
- Check if `current_period_end` has passed
- Verify function has proper permissions

### Issue: Data not being deleted

**Check:**
- Verify `manage-data-deletion` function is running
- Check if `grace_period_end` has passed
- Verify function has proper permissions
- Check function logs for errors

---

## Security Considerations

1. **Service Role Key:** Only use service role key in edge functions, never expose to frontend
2. **Data Deletion:** Ensure all related data is deleted (cascade where possible)
3. **Audit Trail:** Consider logging all deletion operations
4. **Backup:** Ensure backups are taken before deletion (if required by policy)

---

## Next Steps

1. ✅ Apply database migration
2. ✅ Deploy edge functions
3. ⏳ Set up scheduled jobs (cron)
4. ⏳ Test end-to-end workflow
5. ⏳ Monitor and iterate

---

**Last Updated:** January 2025

