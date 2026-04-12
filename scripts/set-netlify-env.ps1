# Generate env.netlify from packages/app/.env.local for Netlify import
# Run from monorepo root: .\scripts\set-netlify-env.ps1
# Then: netlify env:import env.netlify

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$envLocal = Join-Path $root "packages\app\.env.local"
$envExample = Join-Path $root "packages\app\.env.example"
$envNetlify = Join-Path $root "env.netlify"
$envNetlifyExample = Join-Path $root "env.netlify.example"

Write-Host "Netlify environment setup" -ForegroundColor Green
Write-Host ""

if (Test-Path $envLocal) {
    Write-Host "Found packages/app/.env.local — copying VITE_* vars to env.netlify" -ForegroundColor Yellow
    $content = Get-Content $envLocal -Raw
    $lines = $content -split "`n"
    $out = @()
    $out += "# Generated from .env.local for Netlify import"
    $out += "# Run: netlify env:import env.netlify"
    $out += ""
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -match '^VITE_' -or $trimmed -match '^#') {
            # Block server-only secrets that must never be set as Netlify build env vars
            if ($trimmed -match '^(STRIPE_SECRET_KEY|SUPABASE_SERVICE_ROLE|STRIPE_WEBHOOK|VITE_STRIPE_WEBHOOK_SECRET|VITE_STRIPE_LINK_FEDERAL|VITE_STRIPE_LINK_ENTERPRISE=)') { continue }
            $out += $line
        }
    }
    $out | Set-Content $envNetlify -Encoding UTF8
    Write-Host "Created env.netlify" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next step: netlify env:import env.netlify" -ForegroundColor Cyan
    Write-Host "(Run from monorepo root. Link site first: netlify link)" -ForegroundColor Gray
} else {
    Write-Host ".env.local not found. Copy template and fill values:" -ForegroundColor Yellow
    Write-Host "  Copy-Item env.netlify.example env.netlify" -ForegroundColor Cyan
    Write-Host "  Edit env.netlify with your Supabase, Stripe values" -ForegroundColor Cyan
    Write-Host "  netlify env:import env.netlify" -ForegroundColor Cyan
    if (!(Test-Path $envNetlify)) {
        Copy-Item $envNetlifyExample $envNetlify
        Write-Host ""
        Write-Host "Created env.netlify from template — fill in your values before importing." -ForegroundColor Green
    }
}
