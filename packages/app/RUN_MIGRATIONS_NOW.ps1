# ============================================================================
# VendorSoluce - Interactive Migration Execution Script
# Prompts for credentials securely and executes all migrations
# Date: December 2025
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectRef = "dfklqsdfycwjlcasfciu"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🚀 VendorSoluce - Database Migration Execution" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

# Check if password is already in environment
$PostgresPassword = $env:POSTGRES_PASSWORD

if (-not $PostgresPassword) {
    Write-Host "📝 Postgres Password Required" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Get your password from:" -ForegroundColor White
    Write-Host "   https://supabase.com/dashboard/project/$ProjectRef/settings/database" -ForegroundColor Blue
    Write-Host ""
    
    # Securely prompt for password
    $securePassword = Read-Host "Enter Postgres password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $PostgresPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    
    Write-Host ""
}

# Count migration files
$migrationFiles = Get-ChildItem -Path "supabase\migrations" -Filter "*.sql" | Sort-Object Name
$migrationCount = $migrationFiles.Count

Write-Host "📋 Found $migrationCount migration files to execute" -ForegroundColor Cyan
Write-Host ""

# Confirm execution
$confirmation = Read-Host "Do you want to proceed with migration execution? (Y/N)"
if ($confirmation -ne 'Y' -and $confirmation -ne 'y') {
    Write-Host "❌ Migration execution cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔗 Connecting to Supabase..." -ForegroundColor Cyan

# Try Supabase CLI first
try {
    Write-Host "   Attempting Supabase CLI method..." -ForegroundColor Gray
    
    # Link to project
    $linkCommand = "npx supabase link --project-ref $ProjectRef --password '$PostgresPassword' --yes"
    $linkOutput = Invoke-Expression $linkCommand 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Project linked successfully!" -ForegroundColor Green
        
        # Push migrations
        Write-Host "   📤 Pushing migrations..." -ForegroundColor Gray
        $pushOutput = npx supabase db push 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ All migrations applied successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📋 Next Steps:" -ForegroundColor Cyan
            Write-Host "   1. Run VERIFY_MIGRATION_COMPLETION.sql in Supabase SQL Editor" -ForegroundColor White
            Write-Host "   2. Check Supabase Dashboard → Database → Migrations" -ForegroundColor White
            Write-Host "   3. Test authentication and critical flows" -ForegroundColor White
            Write-Host ""
            exit 0
        } else {
            Write-Host "   ⚠️  CLI push failed, trying direct connection..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  CLI link failed, trying direct connection..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  CLI not available, using direct connection..." -ForegroundColor Yellow
}

# Fallback to direct Postgres connection
Write-Host ""
Write-Host "🔗 Attempting direct Postgres connection..." -ForegroundColor Cyan

try {
    # Set environment variable for Node.js script
    $env:POSTGRES_PASSWORD = $PostgresPassword
    $env:SUPABASE_URL = "https://$ProjectRef.supabase.co"
    
    Write-Host "   Running migration script..." -ForegroundColor Gray
    node scripts/apply-migrations-direct.mjs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migrations completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next Steps:" -ForegroundColor Cyan
        Write-Host "   1. Run VERIFY_MIGRATION_COMPLETION.sql in Supabase SQL Editor" -ForegroundColor White
        Write-Host "   2. Check Supabase Dashboard → Database → Migrations" -ForegroundColor White
        Write-Host "   3. Test authentication and critical flows" -ForegroundColor White
        Write-Host ""
        
        # Clear password from environment
        Remove-Item Env:\POSTGRES_PASSWORD
        exit 0
    } else {
        Write-Host ""
        Write-Host "❌ Migration execution failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "📝 Alternative: Manual Migration" -ForegroundColor Cyan
        Write-Host "   1. Go to: https://supabase.com/dashboard/project/$ProjectRef/sql/new" -ForegroundColor White
        Write-Host "   2. Run each migration file from supabase/migrations/ in order" -ForegroundColor White
        Write-Host "   3. See MIGRATION_DEPLOYMENT_GUIDE.md for details" -ForegroundColor White
        Write-Host ""
        
        # Clear password from environment
        Remove-Item Env:\POSTGRES_PASSWORD -ErrorAction SilentlyContinue
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Please try manual migration via Supabase Dashboard" -ForegroundColor Cyan
    Write-Host "   https://supabase.com/dashboard/project/$ProjectRef/sql/new" -ForegroundColor Blue
    Write-Host ""
    
    # Clear password from environment
    Remove-Item Env:\POSTGRES_PASSWORD -ErrorAction SilentlyContinue
    exit 1
}

