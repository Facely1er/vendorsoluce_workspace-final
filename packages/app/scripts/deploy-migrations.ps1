# Database Migration Deployment Script
# This script helps deploy all migrations to Supabase production

param(
    [string]$ProjectRef = "",
    [string]$DatabaseUrl = "",
    [switch]$DryRun = $false
)

Write-Host "🗄️  VendorSoluce Database Migration Deployment" -ForegroundColor Cyan
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

# Get project reference if not provided
if ([string]::IsNullOrEmpty($ProjectRef)) {
    Write-Host "`n📋 Supabase Project Setup" -ForegroundColor Yellow
    Write-Host "You need to link your Supabase project first." -ForegroundColor Yellow
    Write-Host "`nOption 1: Link via CLI" -ForegroundColor Cyan
    Write-Host "  supabase link --project-ref your-project-ref" -ForegroundColor Gray
    Write-Host "`nOption 2: Provide project ref as parameter" -ForegroundColor Cyan
    Write-Host "  .\scripts\deploy-migrations.ps1 -ProjectRef your-project-ref" -ForegroundColor Gray
    Write-Host "`nTo find your project ref:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://supabase.com/dashboard" -ForegroundColor Gray
    Write-Host "  2. Select your project" -ForegroundColor Gray
    Write-Host "  3. Go to Settings → General" -ForegroundColor Gray
    Write-Host "  4. Copy the 'Reference ID'" -ForegroundColor Gray
    exit 1
}

# Verify migrations directory exists
$migrationsPath = "supabase\migrations"
if (-not (Test-Path $migrationsPath)) {
    Write-Host "❌ Migrations directory not found: $migrationsPath" -ForegroundColor Red
    exit 1
}

# Count migration files
$migrationFiles = Get-ChildItem -Path $migrationsPath -Filter "*.sql" | Sort-Object Name
$migrationCount = $migrationFiles.Count

Write-Host "`n✅ Found $migrationCount migration files" -ForegroundColor Green
Write-Host "`nMigration Files:" -ForegroundColor Yellow
foreach ($file in $migrationFiles) {
    Write-Host "  - $($file.Name)" -ForegroundColor Gray
}

if ($DryRun) {
    Write-Host "`n🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host "`nTo actually deploy, run without -DryRun flag" -ForegroundColor Yellow
    exit 0
}

# Confirm before proceeding
Write-Host "`n⚠️  WARNING: This will apply migrations to your PRODUCTION database!" -ForegroundColor Red
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

# Deploy migrations
Write-Host "`n🚀 Deploying migrations..." -ForegroundColor Cyan
supabase db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Migrations deployed successfully!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Verify migrations in Supabase Dashboard → Database → Migrations" -ForegroundColor Gray
Write-Host "  2. Run verification queries from MIGRATION_DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
Write-Host "  3. Test authentication and data access" -ForegroundColor Gray

