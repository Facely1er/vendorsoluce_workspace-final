# Complete Deployment Script
# Orchestrates all deployment steps

param(
    [string]$ProjectRef = "",
    [switch]$SkipMigrations = $false,
    [switch]$SkipFunctions = $false,
    [switch]$DryRun = $false
)

Write-Host "🚀 VendorSoluce Complete Deployment" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`nThis script will:" -ForegroundColor Yellow
Write-Host "  1. Deploy database migrations" -ForegroundColor Gray
Write-Host "  2. Deploy edge functions" -ForegroundColor Gray
Write-Host "  3. Provide webhook configuration instructions" -ForegroundColor Gray

if ($DryRun) {
    Write-Host "`n🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
}

# Get project reference
if ([string]::IsNullOrEmpty($ProjectRef)) {
    Write-Host "`n📋 Supabase Project Reference Required" -ForegroundColor Yellow
    Write-Host "`nTo find your project ref:" -ForegroundColor Cyan
    Write-Host "  1. Go to https://supabase.com/dashboard" -ForegroundColor Gray
    Write-Host "  2. Select your project" -ForegroundColor Gray
    Write-Host "  3. Go to Settings → General" -ForegroundColor Gray
    Write-Host "  4. Copy the 'Reference ID'" -ForegroundColor Gray
    Write-Host "`nThen run:" -ForegroundColor Cyan
    Write-Host "  .\scripts\deploy-all.ps1 -ProjectRef your-project-ref" -ForegroundColor White
    exit 1
}

Write-Host "`n✅ Project Reference: $ProjectRef" -ForegroundColor Green

# Step 1: Deploy Migrations
if (-not $SkipMigrations) {
    Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
    Write-Host "Step 1: Deploying Database Migrations" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "`n[DRY RUN] Would deploy migrations..." -ForegroundColor Yellow
    } else {
        & ".\scripts\deploy-migrations.ps1" -ProjectRef $ProjectRef
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`n❌ Migration deployment failed. Continuing with functions..." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "`n⏭️  Skipping migrations (--SkipMigrations)" -ForegroundColor Yellow
}

# Step 2: Deploy Functions
if (-not $SkipFunctions) {
    Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
    Write-Host "Step 2: Deploying Edge Functions" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "`n[DRY RUN] Would deploy functions..." -ForegroundColor Yellow
    } else {
        & ".\scripts\deploy-functions.ps1" -ProjectRef $ProjectRef
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`n❌ Function deployment had errors. Check output above." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "`n⏭️  Skipping functions (--SkipFunctions)" -ForegroundColor Yellow
}

# Step 3: Webhook Configuration
Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "Step 3: Stripe Webhook Configuration" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

& ".\scripts\setup-stripe-webhook.ps1" -SupabaseProjectUrl "https://$ProjectRef.supabase.co"

# Summary
Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`n✅ Deployment steps completed!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Verify migrations in Supabase Dashboard" -ForegroundColor Gray
Write-Host "  2. Verify functions are deployed" -ForegroundColor Gray
Write-Host "  3. Configure Stripe webhook (instructions above)" -ForegroundColor Gray
Write-Host "  4. Update environment variables in Vercel" -ForegroundColor Gray
Write-Host "  5. Test authentication and checkout flows" -ForegroundColor Gray
Write-Host "  6. Run verification: .\scripts\verify-deployment.ps1" -ForegroundColor Gray

Write-Host "`n🎉 Deployment complete! Ready for testing." -ForegroundColor Green

