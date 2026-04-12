# ============================================================================
# VendorSoluce - Complete Migration Execution Script
# Executes all 18 database migrations using provided credentials
# Date: December 2025
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$PostgresPassword,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectRef = "dfklqsdfycwjlcasfciu",
    
    [Parameter(Mandatory=$false)]
    [string]$SupabaseUrl = "https://dfklqsdfycwjlcasfciu.supabase.co"
)

# Set error handling
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🚀 VendorSoluce - Complete Migration Execution" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

# Get Postgres password from parameter or environment variable
if (-not $PostgresPassword) {
    $PostgresPassword = $env:POSTGRES_PASSWORD
}

if (-not $PostgresPassword) {
    Write-Host "⚠️  Postgres password not provided." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Please provide the Postgres password using one of these methods:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Method 1: Command line parameter" -ForegroundColor White
    Write-Host "   .\EXECUTE_MIGRATIONS.ps1 -PostgresPassword 'your_password'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Method 2: Environment variable" -ForegroundColor White
    Write-Host "   `$env:POSTGRES_PASSWORD = 'your_password'" -ForegroundColor Yellow
    Write-Host "   .\EXECUTE_MIGRATIONS.ps1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Method 3: Get password from Supabase Dashboard" -ForegroundColor White
    Write-Host "   1. Go to: https://supabase.com/dashboard/project/$ProjectRef/settings/database" -ForegroundColor White
    Write-Host "   2. Copy the password from the connection string" -ForegroundColor White
    Write-Host "   3. Use Method 1 or 2 above" -ForegroundColor White
    Write-Host ""
    Write-Host "🔒 Security Note: Password will not be displayed or logged" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✅ Postgres password provided" -ForegroundColor Green
Write-Host "📍 Project Reference: $ProjectRef" -ForegroundColor Gray
Write-Host ""

# Method 1: Try Supabase CLI (Recommended)
Write-Host "🔗 Method 1: Attempting Supabase CLI migration..." -ForegroundColor Cyan
Write-Host ""

try {
    # Check if Supabase CLI is available
    $supabaseCheck = Get-Command supabase -ErrorAction SilentlyContinue
    if (-not $supabaseCheck) {
        Write-Host "   ℹ️  Supabase CLI not found globally, using npx..." -ForegroundColor Gray
        $useNpx = $true
    } else {
        $useNpx = $false
    }
    
    # Link to project
    Write-Host "   Step 1: Linking to Supabase project..." -ForegroundColor Gray
    if ($useNpx) {
        $linkResult = npx supabase link --project-ref $ProjectRef --password $PostgresPassword --yes 2>&1
    } else {
        $linkResult = supabase link --project-ref $ProjectRef --password $PostgresPassword --yes 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Project linked successfully!" -ForegroundColor Green
        Write-Host ""
        
        # Push migrations
        Write-Host "   Step 2: Pushing all migrations..." -ForegroundColor Gray
        if ($useNpx) {
            $pushResult = npx supabase db push 2>&1
        } else {
            $pushResult = supabase db push 2>&1
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ All migrations applied successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📋 Next Steps:" -ForegroundColor Cyan
            Write-Host "   1. Run VERIFY_MIGRATION_COMPLETION.sql to verify" -ForegroundColor White
            Write-Host "   2. Check Supabase Dashboard → Database → Migrations" -ForegroundColor White
            Write-Host "   3. Test critical user flows" -ForegroundColor White
            Write-Host ""
            exit 0
        } else {
            Write-Host "   ⚠️  Supabase CLI push failed, trying alternative method..." -ForegroundColor Yellow
            Write-Host "   Error: $pushResult" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠️  Supabase CLI link failed, trying alternative method..." -ForegroundColor Yellow
        Write-Host "   Error: $linkResult" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  Supabase CLI not available, trying alternative method..." -ForegroundColor Yellow
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 Method 2: Attempting direct Postgres connection..." -ForegroundColor Cyan
Write-Host ""

# Method 2: Direct Postgres connection using Node.js script
try {
    # Set environment variables for the Node.js script
    $env:POSTGRES_PASSWORD = $PostgresPassword
    $env:SUPABASE_URL = $SupabaseUrl
    
    Write-Host "   Running migration script..." -ForegroundColor Gray
    $migrationResult = node scripts/apply-migrations-direct.mjs 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "   ✅ Migrations completed via direct connection!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next Steps:" -ForegroundColor Cyan
        Write-Host "   1. Run VERIFY_MIGRATION_COMPLETION.sql to verify" -ForegroundColor White
        Write-Host "   2. Check Supabase Dashboard → Database → Migrations" -ForegroundColor White
        Write-Host "   3. Test critical user flows" -ForegroundColor White
        Write-Host ""
        exit 0
    } else {
        Write-Host "   ❌ Direct connection migration failed" -ForegroundColor Red
        Write-Host "   Output: $migrationResult" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error running migration script: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "⚠️  Both automated methods failed." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Alternative: Manual Migration via Supabase Dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://supabase.com/dashboard/project/$ProjectRef/sql/new" -ForegroundColor White
Write-Host "2. Run each migration file in order from supabase/migrations/" -ForegroundColor White
Write-Host "3. See MIGRATION_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor White
Write-Host ""
Write-Host "Migration files to run (in order):" -ForegroundColor Cyan
$migrationFiles = Get-ChildItem -Path "supabase\migrations" -Filter "*.sql" | Sort-Object Name
$index = 1
foreach ($file in $migrationFiles) {
    Write-Host "   $index. $($file.Name)" -ForegroundColor Gray
    $index++
}
Write-Host ""

exit 1

