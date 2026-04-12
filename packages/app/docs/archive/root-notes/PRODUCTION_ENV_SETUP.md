# Production Environment Setup Guide

## 🔐 Secure Credential Configuration

This guide will help you configure production environment variables securely in Vercel.

## ⚠️ Security Notice

**NEVER commit actual credentials to git!** Always use environment variables in your hosting platform.

---

## 📋 Production Credentials Checklist

### ✅ Supabase Configuration

- [x] **VITE_SUPABASE_URL**: `https://nuwfdvwqiynzhbbsqagw.supabase.co`
- [x] **VITE_SUPABASE_ANON_KEY**: Configured
- [x] **SUPABASE_SERVICE_ROLE_KEY**: Configured (backend only)

### ✅ Stripe Configuration

- [x] **VITE_STRIPE_PUBLISHABLE_KEY**: Live key available
- [x] **STRIPE_SECRET_KEY**: Live key available
- [ ] **STRIPE_WEBHOOK_SECRET**: Needs to be configured from Stripe Dashboard

### ✅ Vercel Configuration

- [x] **VERCEL_TOKEN**: Available for deployment

---

## 🚀 Step-by-Step Vercel Configuration

### Step 1: Access Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `vendorsoluce.com` project
3. Navigate to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add the following variables for **Production** environment:

#### Supabase Variables

```
VITE_SUPABASE_URL
Value: https://nuwfdvwqiynzhbbsqagw.supabase.co
Environment: Production

VITE_SUPABASE_ANON_KEY
Value: your_supabase_anon_key_here
Environment: Production
Note: Get from Supabase Dashboard → Settings → API → anon public key

SUPABASE_SERVICE_ROLE_KEY
Value: your_supabase_service_role_key_here
Environment: Production
Note: Backend only - for Supabase Edge Functions. Get from Supabase Dashboard → Settings → API → service_role key
```

#### Stripe Variables

```
VITE_STRIPE_PUBLISHABLE_KEY
Value: YOUR_STRIPE_PUBLISHABLE_KEY_stripe_publishable_key_here
Environment: Production
Note: Get from Stripe Dashboard → Developers → API Keys

STRIPE_SECRET_KEY
Value: YOUR_STRIPE_SECRET_KEY_stripe_secret_key_here
Environment: Production
Note: Backend only - for Supabase Edge Functions. Get from Stripe Dashboard → Developers → API Keys

STRIPE_WEBHOOK_SECRET
Value: [Get from Stripe Dashboard → Webhooks]
Environment: Production
Note: Configure after setting up webhook endpoint
```

#### Application Variables

```
VITE_APP_ENV
Value: production
Environment: Production

VITE_APP_VERSION
Value: 1.0.0
Environment: Production

VITE_APP_NAME
Value: VendorSoluce
Environment: Production

VITE_APP_URL
Value: https://vendorsoluce.com
Environment: Production
```

#### Stripe Product Price IDs

You'll need to get these from your Stripe Dashboard after creating products:

```
VITE_STRIPE_PRICE_STARTER
Value: [Get from Stripe Dashboard]
Environment: Production

VITE_STRIPE_PRICE_PROFESSIONAL
Value: [Get from Stripe Dashboard]
Environment: Production

VITE_STRIPE_PRICE_ENTERPRISE
Value: [Get from Stripe Dashboard]
Environment: Production

VITE_STRIPE_PRICE_FEDERAL
Value: [Get from Stripe Dashboard]
Environment: Production
```

---

## 🔧 Vercel CLI Configuration (Alternative)

If you prefer using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Set environment variables
vercel env add VITE_SUPABASE_URL production
# Enter: https://your-project.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Enter: your_supabase_anon_key_here

vercel env add STRIPE_SECRET_KEY production
# Enter: YOUR_STRIPE_SECRET_KEY_stripe_secret_key_here

vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Enter: YOUR_STRIPE_PUBLISHABLE_KEY_stripe_publishable_key_here

# Continue for all other variables...
```

---

## 🔐 Supabase Edge Functions Configuration

For Supabase Edge Functions (webhook handlers), set these secrets:

```bash
# Using Supabase CLI
npx supabase secrets set STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_stripe_secret_key_here

npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

npx supabase secrets set APP_URL=https://vendorsoluce.com
```

Or configure in Supabase Dashboard:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Edge Functions** → **Secrets**
4. Add each secret

---

## ✅ Verification Steps

After configuring environment variables:

1. **Verify in Vercel Dashboard**
   - Go to Settings → Environment Variables
   - Confirm all variables are set for Production environment

2. **Test Build**
   ```bash
   npm run build
   ```

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

4. **Verify Environment Variables in Production**
   - Check Vercel deployment logs
   - Verify application loads correctly
   - Test authentication flow
   - Test Stripe checkout (if applicable)

---

## 🚨 Security Best Practices

1. **Never commit secrets to git**
   - Use `.env.production.example` as template
   - Add `.env.production` to `.gitignore`
   - Use hosting platform environment variables

2. **Rotate credentials regularly**
   - Update Supabase keys if compromised
   - Rotate Stripe keys periodically
   - Update Vercel tokens if needed

3. **Use different keys for different environments**
   - Development: Test keys
   - Staging: Test keys
   - Production: Live keys

4. **Limit access to production credentials**
   - Only share with trusted team members
   - Use secure password managers
   - Enable 2FA on all accounts

---

## 📝 Next Steps

1. ✅ Configure environment variables in Vercel
2. ✅ Set up Supabase Edge Function secrets
3. ✅ Configure Stripe webhook endpoint
4. ✅ Run database migrations
5. ✅ Deploy to production
6. ✅ Test all critical flows
7. ✅ Monitor error rates

---

## 🔗 Related Documentation

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Stripe Webhook Configuration](https://stripe.com/docs/webhooks)
- [Production Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)

---

**Last Updated:** January 2025  
**Status:** ✅ Ready for Production Configuration

