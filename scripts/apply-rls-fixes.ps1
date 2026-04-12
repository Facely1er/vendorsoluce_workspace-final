# PowerShell script to apply RLS policy fixes to Supabase
# This script connects to the database and applies the security fixes

$connectionString = "postgresql://postgres:YOUR_DB_PASSWORD@db.dfklqsdfycwjlcasfciu.supabase.co:5432/postgres"
$sqlFile = "fix-rls-policies.sql"

Write-Host "Applying RLS Policy Fixes to Supabase..." -ForegroundColor Green
Write-Host ""

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "ERROR: psql (PostgreSQL client) is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools or use Supabase Dashboard SQL Editor." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Copy the contents of fix-rls-policies.sql and run it in:" -ForegroundColor Cyan
    Write-Host "https://supabase.com/dashboard/project/dfklqsdfycwjlcasfciu/editor" -ForegroundColor Cyan
    exit 1
}

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: SQL file '$sqlFile' not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Reading SQL file: $sqlFile" -ForegroundColor Yellow
$sqlContent = Get-Content $sqlFile -Raw

Write-Host ""
Write-Host "Connecting to database..." -ForegroundColor Yellow
Write-Host "Host: db.dfklqsdfycwjlcasfciu.supabase.co" -ForegroundColor Cyan

# Execute SQL using psql
try {
    $sqlContent | & psql $connectionString
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ RLS policies fixed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Verify the fixes in Supabase Dashboard" -ForegroundColor Cyan
        Write-Host "2. Run the security linter again to confirm issues are resolved" -ForegroundColor Cyan
        Write-Host "3. Test your application to ensure functionality is maintained" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "⚠ Some errors occurred. Check the output above." -ForegroundColor Yellow
        Write-Host "You may need to run the SQL manually in Supabase Dashboard." -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to execute SQL" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Copy the contents of fix-rls-policies.sql and run it in:" -ForegroundColor Cyan
    Write-Host "https://supabase.com/dashboard/project/dfklqsdfycwjlcasfciu/editor" -ForegroundColor Cyan
}
