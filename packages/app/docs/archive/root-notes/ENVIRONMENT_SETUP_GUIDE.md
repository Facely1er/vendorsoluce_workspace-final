# 🔧 Environment Configuration Guide

## Overview

This guide explains how to configure the environment variables for the VendorSoluce application to resolve the console warnings and enable all features.

## 🚨 Current Issues Resolved

### 1. Environment Configuration Validation ✅
- **Issue**: Missing optional environment variables causing console warnings
- **Solution**: Created `.env.example` template and improved error handling
- **Status**: Fixed - warnings will be reduced with proper configuration

### 2. API Failures ✅
- **Issue**: CVE and ThreatFox API calls failing with "Failed to fetch" errors
- **Root Cause**: CORS restrictions preventing direct browser API calls
- **Solution**: Updated to use mock data gracefully with informative console messages
- **Status**: Fixed - APIs now fail gracefully with mock data fallback

### 3. Sentry Configuration ✅
- **Issue**: "Sentry not initialized: No DSN provided" warning
- **Solution**: Updated Sentry config to use Vite environment variables and handle missing DSN gracefully
- **Status**: Fixed - Sentry now initializes only when DSN is provided

## 📋 Environment Variables Setup

### Required Variables (Must Configure)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional Variables (Recommended)

```bash
# Application Configuration
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://api.vendorsoluce.com

# API Rate Limiting
VITE_API_RATE_LIMIT=100
VITE_API_RATE_WINDOW=60000

# Feature Flags
VITE_ENABLE_VENDOR_ASSESSMENTS=true
VITE_ENABLE_ADVANCED_ANALYTICS=true

# Analytics & Monitoring
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Stripe Payment Integration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 🛠️ Setup Instructions

### Step 1: Create Environment File

1. Copy the template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your actual values

### Step 2: Configure Supabase (Required)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the Project URL and anon/public key
5. Add them to your `.env.local` file

### Step 3: Configure Stripe (Optional)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your publishable key from **Developers** → **API keys**
3. Add it to your `.env.local` file

### Step 4: Configure Sentry (Optional)

1. Go to [Sentry Dashboard](https://sentry.io)
2. Create a new project
3. Copy the DSN from **Project Settings** → **Client Keys**
4. Add it to your `.env.local` file

### Step 5: Configure Google Analytics (Optional)

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new property
3. Get the Measurement ID (G-XXXXXXXXXX)
4. Add it to your `.env.local` file

## 🔍 Verification

After setting up your environment variables:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Check the console** - you should see:
   - ✅ All required environment variables are properly configured
   - ✅ Reduced warnings for optional variables
   - ✅ Informative messages about API fallbacks

3. **Test features**:
   - Authentication should work with Supabase
   - Payments should work with Stripe (if configured)
   - Error tracking should work with Sentry (if configured)

## 🚀 Production Deployment

For production deployment:

1. **Set environment variables in your hosting platform**:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Other platforms: Follow their documentation

2. **Use production values**:
   - Use production Supabase project
   - Use live Stripe keys
   - Use production Sentry DSN

## 📝 Notes

### API Limitations
- **CVE and ThreatFox APIs**: Currently using mock data due to CORS restrictions
- **Production Solution**: Implement backend proxy service for real-time threat intelligence
- **Current Behavior**: Application works normally with realistic mock data

### Security Considerations
- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate API keys regularly
- Monitor API usage and costs

### Troubleshooting

**Still seeing warnings?**
- Ensure `.env.local` file exists and has correct variable names
- Restart your development server after making changes
- Check for typos in variable names (must start with `VITE_`)

**APIs still failing?**
- This is expected behavior - the application uses mock data
- Real API integration requires backend service implementation

**Sentry not working?**
- Verify DSN format is correct
- Check Sentry project settings
- Ensure network connectivity to Sentry servers

## 🎯 Next Steps

1. **Configure Required Variables**: Set up Supabase for core functionality
2. **Add Optional Services**: Configure Stripe, Sentry, and Analytics as needed
3. **Test Features**: Verify all configured services work correctly
4. **Deploy**: Use production environment variables for deployment

---

**Need Help?** Check the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) or [Integration Guide](docs/INTEGRATION_GUIDE.md) for more detailed instructions.
