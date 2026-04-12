# PowerShell script to apply migrations using Supabase CLI
# Usage: .\apply-migrations.ps1

# Ensure script runs from project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Verify we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "   Expected directory: $scriptPath" -ForegroundColor Yellow
    exit 1
}

$projectRef = "dfklqsdfycwjlcasfciu"

Write-Host "🚀 VendorSoluce Migration Application" -ForegroundColor Green
Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Check if Postgres password is provided
if (-not $env:POSTGRES_PASSWORD) {
    Write-Host "⚠️  Postgres password not found in environment variables." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Please provide the Postgres password:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://supabase.com/dashboard/project/$projectRef/settings/database" -ForegroundColor White
    Write-Host "   2. Copy the password from the connection string" -ForegroundColor White
    Write-Host "   3. Set it as an environment variable:" -ForegroundColor White
    Write-Host "      `$env:POSTGRES_PASSWORD = 'your_postgres_password'" -ForegroundColor Yellow
    Write-Host "   4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use the Supabase Dashboard SQL Editor:" -ForegroundColor Cyan
    Write-Host "   https://supabase.com/dashboard/project/$projectRef/sql/new" -ForegroundColor Blue
    Write-Host ""
    exit 1
}

Write-Host "✅ Postgres password found" -ForegroundColor Green
Write-Host ""

# Step 1: Link to project
Write-Host "🔗 Step 1: Linking to Supabase project..." -ForegroundColor Cyan
try {
    npx supabase link --project-ref $projectRef --password $env:POSTGRES_PASSWORD --yes
    Write-Host "✅ Project linked successfully!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error linking project: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "   1. Postgres password is correct" -ForegroundColor White
    Write-Host "   2. Project reference is correct: $projectRef" -ForegroundColor White
    Write-Host "   3. You have access to the project" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Step 2: Push migrations
Write-Host "📤 Step 2: Pushing migrations to production..." -ForegroundColor Cyan
try {
    npx supabase db push
    Write-Host ""
    Write-Host "✅ All migrations applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Verify migrations in Supabase Dashboard → Database → Migrations" -ForegroundColor White
    Write-Host "   2. Check Database Linter for any warnings" -ForegroundColor White
    Write-Host "   3. Test critical user flows" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Error pushing migrations: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "You can also apply migrations manually:" -ForegroundColor Yellow
    Write-Host "   https://supabase.com/dashboard/project/$projectRef/sql/new" -ForegroundColor Blue
    Write-Host ""
    exit 1
}

