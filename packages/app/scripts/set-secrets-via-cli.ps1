# Set Supabase Edge Function Secrets via CLI
# Usage: .\scripts\set-secrets-via-cli.ps1

Write-Host "🔐 Setting Supabase Edge Function Secrets..." -ForegroundColor Cyan
Write-Host ""

$projectRef = "dfklqsdfycwjlcasfciu"

# Check if supabase CLI is available
try {
    $null = npx supabase --version 2>&1
} catch {
    Write-Host "❌ Supabase CLI not available via npx" -ForegroundColor Red
    Write-Host "   Trying alternative method..." -ForegroundColor Yellow
}

Write-Host "📋 Setting secrets for project: $projectRef" -ForegroundColor Cyan
Write-Host ""

# Note: Supabase CLI secrets command requires authentication
# You'll need to be logged in first: npx supabase login

Write-Host "⚠️  Note: Setting secrets requires:" -ForegroundColor Yellow
Write-Host "   1. Supabase CLI authentication (npx supabase login)" -ForegroundColor Yellow
Write-Host "   2. Project linking (npx supabase link --project-ref $projectRef)" -ForegroundColor Yellow
Write-Host ""

# Prompt for secrets
$resendKey = Read-Host "Enter RESEND_API_KEY (or press Enter to skip)"
$emailFrom = Read-Host "Enter EMAIL_FROM (default: VendorSoluce <noreply@vendorsoluce.com>)"
$siteUrl = Read-Host "Enter SITE_URL (default: https://vendorsoluce.com)"

if ([string]::IsNullOrWhiteSpace($emailFrom)) {
    $emailFrom = "VendorSoluce <noreply@vendorsoluce.com>"
}

if ([string]::IsNullOrWhiteSpace($siteUrl)) {
    $siteUrl = "https://vendorsoluce.com"
}

if (![string]::IsNullOrWhiteSpace($resendKey)) {
    Write-Host ""
    Write-Host "🔐 Setting secrets..." -ForegroundColor Cyan
    
    # Try to set secrets via CLI
    Write-Host "Setting RESEND_API_KEY..." -ForegroundColor Yellow
    npx supabase secrets set RESEND_API_KEY=$resendKey --project-ref $projectRef 2>&1
    
    Write-Host "Setting EMAIL_FROM..." -ForegroundColor Yellow
    npx supabase secrets set EMAIL_FROM="$emailFrom" --project-ref $projectRef 2>&1
    
    Write-Host "Setting SITE_URL..." -ForegroundColor Yellow
    npx supabase secrets set SITE_URL=$siteUrl --project-ref $projectRef 2>&1
    
    Write-Host ""
    Write-Host "✅ Secrets set! (If errors occurred, use Dashboard method instead)" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  No RESEND_API_KEY provided. Skipping secret setup." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 To set secrets manually:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://supabase.com/dashboard/project/$projectRef" -ForegroundColor White
    Write-Host "   2. Navigate to: Project Settings → Edge Functions → Secrets" -ForegroundColor White
    Write-Host "   3. Add the 3 secrets listed above" -ForegroundColor White
}

