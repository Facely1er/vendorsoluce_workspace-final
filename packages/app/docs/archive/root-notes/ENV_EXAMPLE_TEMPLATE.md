# Environment Variables Template

**Note:** Create a file named `.env.example` in the root directory with the following content:

```env
# ============================================
# VendorSoluce Environment Configuration
# ============================================
# Copy this file to .env.local for local development
# For production, configure these in your deployment platform (Vercel, etc.)
# ============================================

# ============================================
# REQUIRED - Must be configured for production
# ============================================

# Supabase Configuration
# Get these from: https://supabase.com/dashboard → Your Project → Settings → API
# ⚠️ SECURITY: Replace with your actual Supabase credentials
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# ============================================
# OPTIONAL - Application Configuration
# ============================================

# Application Environment
# Options: development, staging, production
VITE_APP_ENV=development

# Application Version
VITE_APP_VERSION=1.0.0

# Application Name
VITE_APP_NAME=VendorSoluce

# API Base URL (for backend services)
VITE_API_BASE_URL=https://api.vendorsoluce.com

# ============================================
# OPTIONAL - API Rate Limiting
# ============================================

# Maximum API requests per time window
VITE_API_RATE_LIMIT=100

# API rate limit time window in milliseconds (default: 60000 = 1 minute)
VITE_API_RATE_WINDOW=60000

# ============================================
# OPTIONAL - Feature Flags
# ============================================

# Enable vendor assessments feature
# Options: true, false
VITE_ENABLE_VENDOR_ASSESSMENTS=true

# Enable advanced analytics feature
# Options: true, false
VITE_ENABLE_ADVANCED_ANALYTICS=true

# ============================================
# OPTIONAL - Stripe Payment Integration
# ============================================
# Get these from: https://dashboard.stripe.com → Developers → API Keys
# Use test keys (pk_test_...) for development
# Use live keys (pk_live_...) for production

# Stripe Publishable Key (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Stripe Webhook Secret (Backend - Supabase Edge Functions only)
# Get this from: Stripe Dashboard → Developers → Webhooks → Signing secret
VITE_STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Product Price IDs (Monthly)
# Get these from: Stripe Dashboard → Products → Your Product → Pricing
VITE_STRIPE_PRICE_STARTER=price_your_starter_monthly_price_id
VITE_STRIPE_PRICE_PROFESSIONAL=price_your_professional_monthly_price_id
VITE_STRIPE_PRICE_ENTERPRISE=price_your_enterprise_monthly_price_id
VITE_STRIPE_PRICE_FEDERAL=price_your_federal_monthly_price_id

# Stripe Product IDs (Optional - used for product identification)
VITE_STRIPE_PRODUCT_STARTER=prod_your_starter_product_id
VITE_STRIPE_PRODUCT_PROFESSIONAL=prod_your_professional_product_id
VITE_STRIPE_PRODUCT_ENTERPRISE=prod_your_enterprise_product_id
VITE_STRIPE_PRODUCT_FEDERAL=prod_your_federal_product_id

# ============================================
# BACKEND ONLY - Supabase Edge Functions
# ============================================
# These are NOT used in the frontend and should be configured as Supabase secrets
# Configure via: supabase secrets set KEY=value
# Or in Supabase Dashboard → Project Settings → Edge Functions → Secrets

# Stripe Secret Key (Backend only - NEVER expose in frontend)
# Get this from: Stripe Dashboard → Developers → API Keys → Secret key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Supabase Service Role Key (Backend only - NEVER expose in frontend)
# Get this from: Supabase Dashboard → Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ============================================
# OPTIONAL - Monitoring & Analytics
# ============================================

# Sentry DSN for error tracking
# Get this from: https://sentry.io → Your Project → Settings → Client Keys (DSN)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id

# Google Analytics Measurement ID
# Get this from: https://analytics.google.com → Admin → Data Streams
# Format: G-XXXXXXXXXX or UA-XXXXXXXXX-X
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Quick Setup Instructions

1. **Create `.env.example` file:**
   ```bash
   # Copy the content above into a new file named .env.example
   ```

2. **For local development:**
   ```bash
   # Copy .env.example to .env.local
   cp .env.example .env.local
   # Then edit .env.local with your actual values
   ```

3. **For production (Vercel):**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add each variable from the template above
   - Set environment to "Production"
   - Save

4. **For Supabase Edge Functions:**
   ```bash
   # Set secrets for backend functions
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Important Notes

- ✅ `.env.example` should be committed to version control
- ❌ `.env.local` and `.env` should NEVER be committed (already in .gitignore)
- 🔒 Backend secrets (STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY) should be configured as Supabase secrets, not environment variables
- 🚀 For production, always use live keys (pk_live_..., sk_live_...)
- 🧪 For development, use test keys (pk_test_..., sk_test_...)

