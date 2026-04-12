# PowerShell script to set Vercel environment variables
# Run this from the monorepo root directory

Write-Host "Setting up Vercel environment variables..." -ForegroundColor Green
Write-Host ""

# Supabase URL from production setup
$SUPABASE_URL = "https://nuwfdvwqiynzhbbsqagw.supabase.co"

Write-Host "Setting VITE_SUPABASE_URL..." -ForegroundColor Yellow
Write-Host "URL: $SUPABASE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "You'll need to provide the Supabase ANON KEY." -ForegroundColor Yellow
Write-Host "Get it from: https://supabase.com/dashboard → Your Project → Settings → API → anon public key" -ForegroundColor Cyan
Write-Host ""

# Set Supabase URL
Write-Host "Setting VITE_SUPABASE_URL..." -ForegroundColor Yellow
$result = vercel env add VITE_SUPABASE_URL production
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ VITE_SUPABASE_URL set successfully" -ForegroundColor Green
} else {
    Write-Host "Note: You may need to paste the value when prompted" -ForegroundColor Yellow
    Write-Host "Value to paste: $SUPABASE_URL" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Next, set VITE_SUPABASE_ANON_KEY:" -ForegroundColor Yellow
Write-Host "Run: vercel env add VITE_SUPABASE_ANON_KEY production" -ForegroundColor Cyan
Write-Host "Then paste your Supabase anon key when prompted" -ForegroundColor Cyan
Write-Host ""
Write-Host "After setting both variables, Vercel will automatically redeploy." -ForegroundColor Green
