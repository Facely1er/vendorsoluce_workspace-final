# Demo Build Script for Windows PowerShell
# This script builds the demo version of VendorSoluce

Write-Host "🚀 Building Demo Version..." -ForegroundColor Cyan

# Check if .env.demo exists
if (-not (Test-Path ".env.demo")) {
    Write-Host "⚠️  Warning: .env.demo file not found!" -ForegroundColor Yellow
    Write-Host "📝 Creating .env.demo from template..." -ForegroundColor Yellow
    Copy-Item ".env.demo.example" ".env.demo"
    Write-Host "✅ Created .env.demo - Please edit it with your demo credentials" -ForegroundColor Green
    Write-Host ""
}

# Load environment variables from .env.demo
if (Test-Path ".env.demo") {
    Write-Host "📋 Loading environment variables from .env.demo..." -ForegroundColor Cyan
    Get-Content ".env.demo" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Run type check
Write-Host ""
Write-Host "🔍 Running TypeScript type check..." -ForegroundColor Cyan
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Type check failed! Please fix errors before building." -ForegroundColor Red
    exit 1
}

# Build demo version
Write-Host ""
Write-Host "🔨 Building demo version..." -ForegroundColor Cyan
$env:BUILD_MODE = "demo"
npm run build:demo

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Demo build completed successfully!" -ForegroundColor Green
    Write-Host "📦 Output directory: dist-demo/" -ForegroundColor Green
    Write-Host ""
    Write-Host "To preview locally, run:" -ForegroundColor Cyan
    Write-Host "  npm run preview:demo" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Build failed! Check the errors above." -ForegroundColor Red
    exit 1
}

