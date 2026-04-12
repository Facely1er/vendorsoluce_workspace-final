# Post-Migration Checklist - VendorSoluce Production

**Date:** After successful database migrations  
**Status:** ✅ Database ready, now testing application

---

## ✅ Completed Steps

- [x] Database migrations executed successfully
- [x] All 26 tables created
- [x] RLS (Row Level Security) enabled on all tables
- [x] Application deployed to Vercel
- [x] Environment variables configured

---

## 🔍 Step 1: Verify Data Was Inserted

Run these queries in Supabase SQL Editor to verify seed data:

```sql
-- Check assessment frameworks
SELECT name, framework_type, question_count, is_active 
FROM vs_assessment_frameworks 
ORDER BY framework_type;

-- Check pricing tiers
SELECT tier, product_name, price_amount, interval, is_active 
FROM vs_prices 
ORDER BY price_amount;

-- Check CMMC Level 1 questions were inserted
SELECT COUNT(*) as question_count 
FROM vs_assessment_questions 
WHERE framework_id IN (SELECT id FROM vs_assessment_frameworks WHERE framework_type = 'cmmc_level_1');
```

**Expected Results:**
- 4 assessment frameworks (CMMC Level 1, CMMC Level 2, NIST Privacy, Custom)
- 4 pricing tiers (Free, Starter, Professional, Enterprise)
- 17 CMMC Level 1 questions

---

## 🧪 Step 2: Test Production Application

### 2.1 Visit Production URL
**URL:** https://vendorsoluce-pdg22kipi-facelys-projects.vercel.app

### 2.2 Test Authentication Flow
- [ ] **Sign Up:** Create a new user account
  - Verify email/password signup works
  - Check if profile is created in `vs_profiles` table
- [ ] **Sign In:** Log in with existing account
  - Verify login works
  - Check session persistence
- [ ] **Sign Out:** Log out
  - Verify logout works
  - Check redirect to home page

### 2.3 Test Core Features
- [ ] **Dashboard**
  - [ ] Dashboard loads without errors
  - [ ] User data displays correctly
  - [ ] Navigation works

- [ ] **Vendor Management**
  - [ ] Create a new vendor
  - [ ] View vendor list
  - [ ] Edit vendor details
  - [ ] Delete vendor (if applicable)
  - [ ] Verify data appears in `vs_vendors` table

- [ ] **SBOM Analysis**
  - [ ] Upload an SBOM file (CycloneDX or SPDX)
  - [ ] Verify analysis completes
  - [ ] Check results display
  - [ ] Verify data appears in `vs_sbom_analyses` table

- [ ] **Supply Chain Assessments**
  - [ ] Create a new assessment
  - [ ] Complete assessment questions
  - [ ] View assessment results
  - [ ] Verify data appears in `vs_supply_chain_assessments` table

- [ ] **Vendor Assessments**
  - [ ] Create vendor assessment
  - [ ] Select assessment framework (CMMC Level 1, etc.)
  - [ ] Complete assessment questions
  - [ ] View assessment results
  - [ ] Verify data appears in `vs_vendor_assessments` table

### 2.4 Test Stripe Integration (If Applicable)
- [ ] **Pricing Page**
  - [ ] View pricing tiers
  - [ ] Click "Get Started" or "Subscribe"
  - [ ] Verify Stripe checkout opens

- [ ] **Checkout Flow**
  - [ ] Complete test payment (use Stripe test card: 4242 4242 4242 4242)
  - [ ] Verify subscription created
  - [ ] Check data in `vs_subscriptions` table
  - [ ] Verify subscription tier updated in `vs_profiles`

- [ ] **Webhook Verification**
  - [ ] Check Stripe Dashboard for webhook events
  - [ ] Verify webhook received `checkout.session.completed` event
  - [ ] Check `webhook_events` table for processed events

---

## 🔧 Step 3: Verify Database Functionality

### 3.1 Test RLS Policies
Run these queries as a test user (after signing up):

```sql
-- Should only see your own profile
SELECT * FROM vs_profiles;

-- Should only see your own vendors
SELECT * FROM vs_vendors;

-- Should only see your own SBOM analyses
SELECT * FROM vs_sbom_analyses;
```

**Expected:** Each user should only see their own data.

### 3.2 Test Helper Functions
```sql
-- Test subscription limits function (replace with actual user_id)
SELECT * FROM get_user_subscription_limits('your-user-id-here');

-- Test usage limit check
SELECT * FROM check_usage_limit('your-user-id-here', 'vendors');
```

---

## 📊 Step 4: Monitor Application Health

### 4.1 Check Browser Console
1. Open production URL
2. Press F12 to open Developer Tools
3. Check Console tab for errors
4. Check Network tab for failed requests

### 4.2 Check Vercel Logs
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: `vendorsoluce-com`
3. Go to **Deployments** → Latest deployment → **Logs**
4. Check for any errors or warnings

### 4.3 Check Supabase Logs
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `nuwfdvwqiynzhbbsqagw`
3. Go to **Logs** → **Postgres Logs**
4. Check for any database errors

---

## ⚙️ Step 5: Configure Monitoring (Optional but Recommended)

### 5.1 Set Up Sentry (Error Tracking)
- [ ] Configure Sentry DSN in Vercel environment variables
- [ ] Test error reporting
- [ ] Set up error alerts

### 5.2 Set Up Uptime Monitoring
- [ ] Configure UptimeRobot or similar service
- [ ] Set up alerts for downtime
- [ ] Monitor response times

### 5.3 Set Up Performance Monitoring
- [ ] Enable Vercel Analytics
- [ ] Monitor Core Web Vitals
- [ ] Track page load times

---

## 🎯 Step 6: Post-Launch Tasks

### Immediate (Today)
- [ ] Test all critical user flows
- [ ] Verify authentication works end-to-end
- [ ] Test at least one complete vendor assessment
- [ ] Check mobile responsiveness

### Short-term (This Week)
- [ ] Monitor error rates
- [ ] Gather user feedback
- [ ] Fix any critical bugs found
- [ ] Document any issues discovered

### Medium-term (This Month)
- [ ] Improve test coverage
- [ ] Optimize performance
- [ ] Add missing features
- [ ] Enhance monitoring

---

## 🐛 Troubleshooting Common Issues

### Issue: "Cannot read property of undefined"
**Solution:** Check browser console for specific error, verify environment variables are set correctly

### Issue: "RLS policy violation"
**Solution:** Verify user is authenticated, check RLS policies are correct

### Issue: "Table doesn't exist"
**Solution:** Verify migrations ran successfully, check table names match code

### Issue: Authentication not working
**Solution:** 
- Check Supabase URL and anon key in Vercel
- Verify RLS policies on `vs_profiles`
- Check browser console for auth errors

### Issue: Stripe checkout not working
**Solution:**
- Verify Stripe keys are set in Vercel
- Check webhook endpoint is configured
- Verify webhook secret is set

---

## ✅ Success Criteria

Your application is production-ready when:
- [x] Database migrations completed
- [ ] Authentication works (sign up, sign in, sign out)
- [ ] Core features work (vendors, SBOM, assessments)
- [ ] No critical errors in browser console
- [ ] No database errors in Supabase logs
- [ ] Application loads in reasonable time (< 3 seconds)

---

## 📝 Notes

- **Database:** All migrations completed successfully ✅
- **Deployment:** Application is live on Vercel ✅
- **Next:** Test application functionality
- **Priority:** Authentication and core features first

---

**Last Updated:** After successful migrations  
**Status:** Ready for testing  
**Next Action:** Test production application

