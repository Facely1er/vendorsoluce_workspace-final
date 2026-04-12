# Supabase Edge Functions Deployment Script
# Deploys all edge functions to Supabase production

param(
    [string]$ProjectRef = "",
    [switch]$DryRun = $false
)

Write-Host "⚡ VendorSoluce Edge Functions Deployment" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Check if Supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g supabase
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Supabase CLI" -ForegroundColor Red
        exit 1
    }
}

# Verify functions directory exists
$functionsPath = "supabase\functions"
if (-not (Test-Path $functionsPath)) {
    Write-Host "❌ Functions directory not found: $functionsPath" -ForegroundColor Red
    exit 1
}

# Get all function directories
$functions = Get-ChildItem -Path $functionsPath -Directory | Where-Object { 
    Test-Path (Join-Path $_.FullName "index.ts")
}

$functionCount = $functions.Count
Write-Host "`n✅ Found $functionCount edge functions" -ForegroundColor Green
Write-Host "`nFunctions to Deploy:" -ForegroundColor Yellow
foreach ($func in $functions) {
    Write-Host "  - $($func.Name)" -ForegroundColor Gray
}

if ($DryRun) {
    Write-Host "`n🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host "`nTo actually deploy, run without -DryRun flag" -ForegroundColor Yellow
    exit 0
}

# Get project reference if not provided
if ([string]::IsNullOrEmpty($ProjectRef)) {
    Write-Host "`n📋 Supabase Project Setup" -ForegroundColor Yellow
    Write-Host "You need to link your Supabase project first." -ForegroundColor Yellow
    Write-Host "`nOption 1: Link via CLI" -ForegroundColor Cyan
    Write-Host "  supabase link --project-ref your-project-ref" -ForegroundColor Gray
    Write-Host "`nOption 2: Provide project ref as parameter" -ForegroundColor Cyan
    Write-Host "  .\scripts\deploy-functions.ps1 -ProjectRef your-project-ref" -ForegroundColor Gray
    exit 1
}

# Confirm before proceeding
Write-Host "`n⚠️  WARNING: This will deploy functions to PRODUCTION!" -ForegroundColor Red
$confirm = Read-Host "Type 'yes' to continue"
if ($confirm -ne "yes") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

# Link to project if not already linked
Write-Host "`n🔗 Linking to Supabase project..." -ForegroundColor Cyan
supabase link --project-ref $ProjectRef
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to link to project" -ForegroundColor Red
    exit 1
}

# Deploy each function
Write-Host "`n🚀 Deploying functions..." -ForegroundColor Cyan
$deployed = 0
$failed = 0

foreach ($func in $functions) {
    $funcName = $func.Name
    Write-Host "`n  Deploying $funcName..." -ForegroundColor Yellow
    
    supabase functions deploy $funcName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $funcName deployed successfully" -ForegroundColor Green
        $deployed++
    } else {
        Write-Host "  ❌ $funcName deployment failed" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "  ✅ Deployed: $deployed" -ForegroundColor Green
Write-Host "  ❌ Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })
Write-Host "  📦 Total: $functionCount" -ForegroundColor Gray

if ($failed -eq 0) {
    Write-Host "`n✅ All functions deployed successfully!" -ForegroundColor Green
    Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Verify functions in Supabase Dashboard → Edge Functions" -ForegroundColor Gray
    Write-Host "  2. Configure environment variables for each function" -ForegroundColor Gray
    Write-Host "  3. Test function endpoints" -ForegroundColor Gray
    Write-Host "  4. Configure Stripe webhook to use stripe-webhook function" -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  Some functions failed to deploy. Check errors above." -ForegroundColor Yellow
    exit 1
}

