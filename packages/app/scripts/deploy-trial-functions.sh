#!/bin/bash
# Deploy Trial & Onboarding Edge Functions
# Usage: ./scripts/deploy-trial-functions.sh

set -e

echo "🚀 Deploying Trial & Onboarding Edge Functions..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo "📦 Deploying functions..."
echo ""

# Deploy each function
echo "1️⃣  Deploying trial-cron..."
supabase functions deploy trial-cron

echo "2️⃣  Deploying manage-trial-expiration..."
supabase functions deploy manage-trial-expiration

echo "3️⃣  Deploying send-trial-notification..."
supabase functions deploy send-trial-notification

echo "4️⃣  Deploying send-onboarding-complete-email..."
supabase functions deploy send-onboarding-complete-email

echo ""
echo "✅ All functions deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Set environment variables in Supabase Dashboard:"
echo "      - RESEND_API_KEY"
echo "      - EMAIL_FROM"
echo "      - SITE_URL"
echo "   2. Set up cron job (see TRIAL_ONBOARDING_SETUP_COMPLETE.md)"
echo "   3. Test the system (see DEPLOYMENT_CHECKLIST.md)"

