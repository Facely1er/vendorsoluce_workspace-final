# VendorSoluce Production Deployment Script (PowerShell)
# This script automates the deployment process for Windows

param(
    [switch]$SkipBuild,
    [switch]$SkipMigrations,
    [switch]$SkipWebhook
)

$ErrorActionPreference = "Stop"

# Ensure script runs from project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "🚀 Starting VendorSoluce Production Deployment..." -ForegroundColor Cyan
Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Colors
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Blue }
function Write-Success { param($msg) Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Step 1: Pre-deployment checks
Write-Info "Running pre-deployment checks..."

# Verify we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root directory."
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "   Expected directory: $scriptPath" -ForegroundColor Yellow
    exit 1
}
Write-Success "Verified project root directory"

# Check Node.js version
$nodeVersion = (node --version) -replace 'v', '' -split '\.' | Select-Object -First 1
if ([int]$nodeVersion -lt 16) {
    Write-Error "Node.js version 16+ is required. Current version: $(node --version)"
    exit 1
}
Write-Success "Node.js version check passed: $(node --version)"

# Step 2: Install dependencies
Write-Info "Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}
Write-Success "Dependencies installed successfully"

# Step 3: Type check
Write-Info "Running type check..."
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Error "Type checking failed. Please fix TypeScript errors before deployment."
    exit 1
}
Write-Success "Type checking passed"

# Step 4: Build for production
if (-not $SkipBuild) {
    Write-Info "Building for production..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed. Please fix build errors before deployment."
        Write-Warning "If the error is related to PostCSS/TailwindCSS, try: npm install --save-dev tailwindcss postcss autoprefixer"
        exit 1
    }
    Write-Success "Build completed successfully"
    
    # Verify build output
    if (Test-Path "dist") {
        $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Success "Build output verified. Size: $([math]::Round($distSize, 2)) MB"
    } else {
        Write-Error "Build output directory 'dist' not found."
        exit 1
    }
} else {
    Write-Warning "Skipping build step"
}

# Step 5: Display environment variables configuration
Write-Info "Environment Variables Configuration"
Write-Host ""
Write-Host "Please configure these environment variables in Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "https://vercel.com/dashboard -> Your Project -> Settings -> Environment Variables" -ForegroundColor Yellow
Write-Host ""
Write-Host "Required Variables:" -ForegroundColor Cyan
Write-Host "VITE_SUPABASE_URL=<your-supabase-url>" -ForegroundColor Gray
Write-Host "VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>" -ForegroundColor Gray
Write-Host "SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>" -ForegroundColor Gray
Write-Host "VITE_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>" -ForegroundColor Gray
Write-Host "STRIPE_SECRET_KEY=<your-stripe-secret-key>" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  SECURITY: Replace placeholders with actual values from your Supabase and Stripe dashboards" -ForegroundColor Yellow
Write-Host "   Never commit actual credentials to git!" -ForegroundColor Yellow
Write-Host "VITE_APP_ENV=production"
Write-Host "VITE_APP_VERSION=1.0.0"
Write-Host "VITE_APP_NAME=VendorSoluce"
Write-Host ""

# Step 6: Database migrations reminder
if (-not $SkipMigrations) {
    Write-Info "Database Migrations"
    Write-Host "Please run all 9 migration files in Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host "https://supabase.com/dashboard -> Your Project -> SQL Editor" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Migration files (in order):" -ForegroundColor Cyan
    Get-ChildItem -Path "supabase\migrations" -Filter "*.sql" | Sort-Object Name | ForEach-Object {
        Write-Host "  - $($_.Name)"
    }
    Write-Host ""
}

# Step 7: Stripe webhook reminder
if (-not $SkipWebhook) {
    Write-Info "Stripe Webhook Configuration"
    Write-Host "Please configure Stripe webhook:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://dashboard.stripe.com/webhooks" -ForegroundColor Yellow
    Write-Host "2. Add endpoint: <your-supabase-url>/functions/v1/stripe-webhook" -ForegroundColor Yellow
    Write-Host "   (Replace <your-supabase-url> with your actual Supabase project URL)" -ForegroundColor Gray
    Write-Host "3. Select events: checkout.session.completed, customer.subscription.*, invoice.*" -ForegroundColor Yellow
    Write-Host "4. Copy webhook secret and add to Vercel as STRIPE_WEBHOOK_SECRET" -ForegroundColor Yellow
    Write-Host ""
}

# Step 8: Deploy to Vercel
Write-Info "Deploying to Vercel production..."

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>&1
    Write-Success "Vercel CLI found: $vercelVersion"
} catch {
    Write-Warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install Vercel CLI"
        exit 1
    }
}

# Deploy to production
Write-Info "Deploying to production..."
Write-Warning "⚠️  SECURITY: Vercel token should be set via environment variable or Vercel CLI login"
Write-Warning "   Using 'vercel --prod' without token (will prompt for login if needed)"
vercel --prod
if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed. Please check the error messages above."
    exit 1
}

Write-Success "Deployment completed successfully!"

# Step 9: Post-deployment summary
Write-Host ""
Write-Success "🎉 VendorSoluce is now live in production!"
Write-Host ""
Write-Info "Next steps:"
Write-Host "1. Verify the deployment in Vercel Dashboard"
Write-Host "2. Test all critical user flows"
Write-Host "3. Monitor error rates (Sentry)"
Write-Host "4. Monitor performance metrics"
Write-Host "5. Check Stripe webhook events"
Write-Host ""

Write-Success "Deployment script completed successfully!"

