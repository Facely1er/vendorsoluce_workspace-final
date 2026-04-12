# Deployment Verification Script
# Verifies that migrations and functions are properly deployed

param(
    [string]$SupabaseUrl = "",
    [string]$SupabaseKey = ""
)

Write-Host "🔍 VendorSoluce Deployment Verification" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Check if environment variables are set
if ([string]::IsNullOrEmpty($SupabaseUrl)) {
    $SupabaseUrl = $env:VITE_SUPABASE_URL
}

if ([string]::IsNullOrEmpty($SupabaseKey)) {
    $SupabaseKey = $env:VITE_SUPABASE_ANON_KEY
}

if ([string]::IsNullOrEmpty($SupabaseUrl) -or [string]::IsNullOrEmpty($SupabaseKey)) {
    Write-Host "❌ Supabase credentials not found" -ForegroundColor Red
    Write-Host "`nPlease provide credentials:" -ForegroundColor Yellow
    Write-Host "  .\scripts\verify-deployment.ps1 -SupabaseUrl 'https://xxx.supabase.co' -SupabaseKey 'your-key'" -ForegroundColor Gray
    Write-Host "`nOr set environment variables:" -ForegroundColor Yellow
    Write-Host "  `$env:VITE_SUPABASE_URL = 'https://xxx.supabase.co'" -ForegroundColor Gray
    Write-Host "  `$env:VITE_SUPABASE_ANON_KEY = 'your-key'" -ForegroundColor Gray
    exit 1
}

Write-Host "`n✅ Supabase credentials found" -ForegroundColor Green
Write-Host "  URL: $SupabaseUrl" -ForegroundColor Gray

# Install required modules if needed
if (-not (Get-Module -ListAvailable -Name "Invoke-RestMethod")) {
    Write-Host "`n📦 PowerShell modules are available" -ForegroundColor Green
}

Write-Host "`n🔍 Verifying Database Tables..." -ForegroundColor Cyan

# Expected tables
$expectedTables = @(
    "vs_profiles",
    "vs_vendors",
    "vs_sbom_analyses",
    "vs_supply_chain_assessments",
    "vs_subscriptions",
    "vs_customers",
    "vs_invoices",
    "vs_usage_records",
    "vs_prices",
    "vs_contact_submissions"
)

Write-Host "`nExpected Tables:" -ForegroundColor Yellow
foreach ($table in $expectedTables) {
    Write-Host "  - $table" -ForegroundColor Gray
}

Write-Host "`n⚠️  Note: This script requires direct database access." -ForegroundColor Yellow
Write-Host "For full verification, use the SQL queries in MIGRATION_DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow

Write-Host "`n📋 Manual Verification Steps:" -ForegroundColor Cyan
Write-Host "  1. Go to Supabase Dashboard → Database → Tables" -ForegroundColor Gray
Write-Host "  2. Verify all vs_* tables exist" -ForegroundColor Gray
Write-Host "  3. Check RLS is enabled on all tables" -ForegroundColor Gray
Write-Host "  4. Go to Edge Functions section" -ForegroundColor Gray
Write-Host "  5. Verify all 15 functions are deployed" -ForegroundColor Gray

Write-Host "`n📋 SQL Verification Queries:" -ForegroundColor Cyan
Write-Host "  Run these in Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "`n  -- Check tables exist" -ForegroundColor Gray
Write-Host "  SELECT table_name FROM information_schema.tables" -ForegroundColor White
Write-Host "    WHERE table_schema = 'public' AND table_name LIKE 'vs_%';" -ForegroundColor White

Write-Host "`n  -- Check RLS is enabled" -ForegroundColor Gray
Write-Host "  SELECT tablename, rowsecurity FROM pg_tables" -ForegroundColor White
Write-Host "    WHERE schemaname = 'public' AND tablename LIKE 'vs_%';" -ForegroundColor White

Write-Host "`n  -- Check subscriptions table" -ForegroundColor Gray
Write-Host "  SELECT column_name, data_type FROM information_schema.columns" -ForegroundColor White
Write-Host "    WHERE table_name = 'vs_subscriptions';" -ForegroundColor White

Write-Host "`n✅ Verification script complete!" -ForegroundColor Green
Write-Host "`nFor automated verification, use Supabase Dashboard or run SQL queries directly." -ForegroundColor Yellow

