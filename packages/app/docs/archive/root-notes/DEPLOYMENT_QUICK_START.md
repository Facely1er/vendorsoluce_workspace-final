# 🚀 Quick Start Deployment Guide

**Complete your deployment in 3 simple steps!**

---

## Prerequisites

1. **Supabase Project Reference**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project → Settings → General
   - Copy the "Reference ID"

2. **Supabase CLI** (will be installed automatically if missing)

3. **Environment Variables** (update in Vercel after deployment)

---

## Step 1: Deploy Everything (Automated)

Run the complete deployment script:

```powershell
.\scripts\deploy-all.ps1 -ProjectRef your-project-ref
```

This will:
- ✅ Deploy all 16 database migrations
- ✅ Deploy all 15 edge functions
- ✅ Provide Stripe webhook configuration instructions

**Dry Run (test first):**
```powershell
.\scripts\deploy-all.ps1 -ProjectRef your-project-ref -DryRun
```

---

## Step 2: Configure Stripe Webhook

After deployment, configure your Stripe webhook:

```powershell
.\scripts\setup-stripe-webhook.ps1
```

Or manually:
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
3. Select events (see script output for list)
4. Copy webhook secret to environment variables

---

## Step 3: Update Environment Variables

In **Vercel Dashboard** → Settings → Environment Variables, add:

```env
# Supabase (after key rotation)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY
VITE_STRIPE_PRICE_STARTER=price_xxxxx
VITE_STRIPE_PRICE_PROFESSIONAL=price_xxxxx
VITE_STRIPE_PRICE_ENTERPRISE=price_xxxxx
VITE_STRIPE_PRICE_FEDERAL=price_xxxxx

# Backend (for Edge Functions)
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## Individual Scripts (If Needed)

### Deploy Migrations Only
```powershell
.\scripts\deploy-migrations.ps1 -ProjectRef your-project-ref
```

### Deploy Functions Only
```powershell
.\scripts\deploy-functions.ps1 -ProjectRef your-project-ref
```

### Verify Deployment
```powershell
.\scripts\verify-deployment.ps1
```

---

## Troubleshooting

### "Supabase CLI not found"
The script will automatically install it, or install manually:
```powershell
npm install -g supabase
```

### "Project not linked"
Link manually:
```powershell
supabase link --project-ref your-project-ref
```

### "Migration failed"
- Check Supabase Dashboard → Database → Migrations for errors
- Verify you have proper permissions
- Ensure database is not locked

### "Function deployment failed"
- Check function logs in Supabase Dashboard
- Verify environment variables are set for functions
- Check function code for syntax errors

---

## Verification Checklist

After deployment, verify:

- [ ] All migrations applied (Supabase Dashboard → Database → Migrations)
- [ ] All tables exist (check `vs_*` tables)
- [ ] RLS enabled on all tables
- [ ] All 15 functions deployed (Supabase Dashboard → Edge Functions)
- [ ] Stripe webhook configured and receiving events
- [ ] Environment variables updated in Vercel
- [ ] Test authentication works
- [ ] Test checkout flow works

---

## Need Help?

- **Migrations:** See `MIGRATION_DEPLOYMENT_GUIDE.md`
- **Functions:** See function-specific documentation
- **Configuration:** See `CONFIGURATION_COMPLETE.md`
- **Overall Status:** See `SETUP_COMPLETE_SUMMARY.md`

---

**Ready to deploy? Run the script and you're done!** 🚀

