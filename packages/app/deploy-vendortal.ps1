# PowerShell script to deploy vendortal.com on Vercel
# Run this script from the project root directory

Write-Host "🚀 Deploying VendorTal to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found!" -ForegroundColor Red
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm i -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Vercel CLI found" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Cyan
$vercelWhoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in to Vercel" -ForegroundColor Yellow
    Write-Host "🔑 Logging in..." -ForegroundColor Cyan
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to login to Vercel" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Logged in as: $vercelWhoami" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Pre-deployment checklist:" -ForegroundColor Cyan
Write-Host "  1. Ensure vendortal.com domain is added in Vercel Dashboard" -ForegroundColor White
Write-Host "  2. DNS records are configured for vendortal.com" -ForegroundColor White
Write-Host "  3. Environment variables are set in Vercel:" -ForegroundColor White
Write-Host "     - VITE_VENDOR_PORTAL_URL=https://vendortal.com" -ForegroundColor Gray
Write-Host "     - VITE_VENDOR_PORTAL_DOMAIN=vendortal.com" -ForegroundColor Gray
Write-Host ""
$continue = Read-Host "Continue with deployment? (y/n)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🏗️  Building project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Deploying to Vercel (Production)..." -ForegroundColor Cyan
vercel --prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify DNS propagation: nslookup vendortal.com" -ForegroundColor White
Write-Host "  2. Test vendortal.com in browser" -ForegroundColor White
Write-Host "  3. Check SSL certificate in Vercel dashboard" -ForegroundColor White
Write-Host "  4. Verify environment variables are set" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan

