# 🔧 Vercel Environment Variables Configuration Guide

## Required Environment Variables for Production

To make your VendorSoluce platform fully operational, you need to configure these environment variables in your Vercel dashboard.

### 📍 **How to Configure in Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `vendorsoluce-com` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable below with the appropriate values

### 🔑 **Essential Environment Variables**

#### **Supabase Configuration**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### **Stripe Configuration**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### **Stripe Product Price IDs (Monthly)**
```
VITE_STRIPE_PRICE_STARTER_MONTHLY=price_1SDebCIUB3FoXZdh8dp42ehe
VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_1SDebBIUB3FoXZdhcPdM4wpJ
VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY=price_1SDebAIUB3FoXZdhVCNrKzTl
VITE_STRIPE_PRICE_FEDERAL_MONTHLY=price_1SEW7LIUB3FoXZdhCMLRq822
```

#### **Stripe Product Price IDs (Annual)**
```
VITE_STRIPE_PRICE_STARTER_ANNUAL=price_1SDebCIUB3FoXZdhoTWIonmT
VITE_STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_1SDebBIUB3FoXZdhkYjMHNtc
VITE_STRIPE_PRICE_ENTERPRISE_ANNUAL=price_1SDebAIUB3FoXZdhxCMBROTw
VITE_STRIPE_PRICE_FEDERAL_ANNUAL=price_1SEW7MIUB3FoXZdhbOONitHb
```

#### **Application Configuration**
```
VITE_APP_NAME=VendorSoluce
VITE_APP_URL=https://vendorsoluce-com.vercel.app
VITE_ENVIRONMENT=production
VITE_ENABLE_STRIPE_PAYMENTS=true
```

### 🎯 **Where to Get These Values**

#### **Supabase Keys**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the Project URL and anon/public key
5. Copy the service_role key (keep this secret!)

#### **Stripe Keys**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API Keys**
3. Copy the Publishable key (starts with `pk_test_`)
4. Copy the Secret key (starts with `sk_test_`)
5. For webhook secret, go to **Webhooks** → **Add endpoint**

### ⚠️ **Important Notes**

1. **Test vs Live Keys**: Start with test keys (`pk_test_`, `sk_test_`) for development
2. **Environment**: Set all variables for **Production** environment
3. **Security**: Never commit secret keys to your repository
4. **Webhook Secret**: You'll get this after setting up webhooks

### 🚀 **After Configuration**

Once you've added all environment variables:

1. **Redeploy**: Vercel will automatically redeploy with new environment variables
2. **Test**: Verify the configuration is working
3. **Go Live**: Switch to live Stripe keys when ready for production

### 📞 **Need Help?**

If you need assistance getting these keys:
- **Supabase**: Check the Supabase documentation
- **Stripe**: Check the Stripe documentation
- **Vercel**: Check the Vercel environment variables guide
