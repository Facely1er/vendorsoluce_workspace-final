# Deploy Trial & Onboarding Edge Functions
# Usage: .\scripts\deploy-trial-functions.ps1

Write-Host "🚀 Deploying Trial & Onboarding Edge Functions..." -ForegroundColor Cyan
Write-Host ""

# Check if supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
try {
    $null = supabase projects list 2>&1
} catch {
    Write-Host "❌ Not logged in to Supabase. Please run:" -ForegroundColor Red
    Write-Host "   supabase login" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Deploying functions..." -ForegroundColor Cyan
Write-Host ""

# Deploy each function
Write-Host "1️⃣  Deploying trial-cron..." -ForegroundColor Yellow
supabase functions deploy trial-cron

Write-Host "2️⃣  Deploying manage-trial-expiration..." -ForegroundColor Yellow
supabase functions deploy manage-trial-expiration

Write-Host "3️⃣  Deploying send-trial-notification..." -ForegroundColor Yellow
supabase functions deploy send-trial-notification

Write-Host "4️⃣  Deploying send-onboarding-complete-email..." -ForegroundColor Yellow
supabase functions deploy send-onboarding-complete-email

Write-Host ""
Write-Host "✅ All functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Set environment variables in Supabase Dashboard:"
Write-Host "      - RESEND_API_KEY"
Write-Host "      - EMAIL_FROM"
Write-Host "      - SITE_URL"
Write-Host "   2. Set up cron job (see TRIAL_ONBOARDING_SETUP_COMPLETE.md)"
Write-Host "   3. Test the system (see DEPLOYMENT_CHECKLIST.md)"

