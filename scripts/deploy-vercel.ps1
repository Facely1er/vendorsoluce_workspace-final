# PowerShell script to deploy both app and website to Vercel
# Run this from the monorepo root directory

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("app", "website", "both")]
    [string]$Target = "both",
    
    [Parameter(Mandatory=$false)]
    [switch]$Production,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🚀 Vercel Deployment Script" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "✓ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Vercel CLI not found. Installing..." -ForegroundColor Red
    Write-Host "Run: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
try {
    vercel whoami | Out-Null
    Write-Host "✓ Logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "✗ Not logged in to Vercel" -ForegroundColor Red
    Write-Host "Run: vercel login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Function to deploy app
function Deploy-App {
    Write-Host ""
    Write-Host "📦 Deploying App (React/Vite)..." -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    Push-Location packages/app
    
    try {
        if ($Production) {
            Write-Host "Deploying to production..." -ForegroundColor Yellow
            vercel --prod
        } else {
            Write-Host "Deploying to preview..." -ForegroundColor Yellow
            vercel
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ App deployed successfully!" -ForegroundColor Green
        } else {
            Write-Host "✗ App deployment failed" -ForegroundColor Red
            Pop-Location
            exit 1
        }
    } catch {
        Write-Host "✗ Error deploying app: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    } finally {
        Pop-Location
    }
}

# Function to deploy website
function Deploy-Website {
    Write-Host ""
    Write-Host "🌐 Deploying Website (Static HTML)..." -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    
    Push-Location packages/website
    
    try {
        # Build CSS first
        if (-not $SkipBuild) {
            Write-Host "Building CSS..." -ForegroundColor Yellow
            npm run build:css
            if ($LASTEXITCODE -ne 0) {
                Write-Host "✗ CSS build failed" -ForegroundColor Red
                Pop-Location
                exit 1
            }
            Write-Host "✓ CSS built successfully" -ForegroundColor Green
        }
        
        # Deploy
        if ($Production) {
            Write-Host "Deploying to production..." -ForegroundColor Yellow
            vercel --prod
        } else {
            Write-Host "Deploying to preview..." -ForegroundColor Yellow
            vercel
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Website deployed successfully!" -ForegroundColor Green
        } else {
            Write-Host "✗ Website deployment failed" -ForegroundColor Red
            Pop-Location
            exit 1
        }
    } catch {
        Write-Host "✗ Error deploying website: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    } finally {
        Pop-Location
    }
}

# Main deployment logic
switch ($Target) {
    "app" {
        Deploy-App
    }
    "website" {
        Deploy-Website
    }
    "both" {
        Deploy-App
        Deploy-Website
    }
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check your Vercel dashboard for deployment URLs" -ForegroundColor Cyan
Write-Host "2. Verify environment variables are set (especially for app)" -ForegroundColor Cyan
Write-Host "3. Test the deployed applications" -ForegroundColor Cyan
Write-Host ""
