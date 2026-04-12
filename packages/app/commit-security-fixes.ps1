# PowerShell Script to Commit and Push Security Fixes
# This script stages, commits, and pushes all security-related changes

$ErrorActionPreference = "Stop"

Write-Host "🔒 Committing Security Fixes to Repository" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "   Please install Git or add it to your PATH" -ForegroundColor Yellow
    Write-Host "   Download from: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "❌ Error: Not a git repository" -ForegroundColor Red
    Write-Host "   Please run this script from the repository root" -ForegroundColor Yellow
    exit 1
}

# Check current branch
$currentBranch = git branch --show-current
Write-Host "📋 Current branch: $currentBranch" -ForegroundColor Blue
Write-Host ""

# Step 1: Check status
Write-Host "📊 Checking git status..." -ForegroundColor Cyan
git status --short
Write-Host ""

# Step 2: Verify .env.local is not being committed
$envLocalStaged = git diff --cached --name-only | Select-String -Pattern "\.env\.local"
if ($envLocalStaged) {
    Write-Host "⚠️  WARNING: .env.local is staged for commit!" -ForegroundColor Red
    Write-Host "   This file should NOT be committed. Unstaging..." -ForegroundColor Yellow
    git reset HEAD .env.local
    Write-Host "   ✅ Unstaged .env.local" -ForegroundColor Green
}

# Step 3: Stage security-related files
Write-Host "📦 Staging security fixes..." -ForegroundColor Cyan

$filesToStage = @(
    "src/utils/config.ts",
    "deploy-to-production.ps1",
    "scripts/setup-cron-job-with-connection.mjs",
    ".gitignore",
    ".env.example",
    "ENV_EXAMPLE_TEMPLATE.md",
    "SECURITY_SETUP_COMPLETE.md",
    "COMMIT_SECURITY_FIXES.md"
)

$stagedCount = 0
foreach ($file in $filesToStage) {
    if (Test-Path $file) {
        git add $file
        $stagedCount++
        Write-Host "   ✅ Staged: $file" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Staged $stagedCount files" -ForegroundColor Green
Write-Host ""

# Step 4: Show what will be committed
Write-Host "📋 Files to be committed:" -ForegroundColor Cyan
git diff --cached --name-only
Write-Host ""

# Step 5: Ask for confirmation
$confirm = Read-Host "Do you want to commit these changes? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Commit cancelled" -ForegroundColor Yellow
    exit 0
}

# Step 6: Commit
Write-Host ""
Write-Host "💾 Committing changes..." -ForegroundColor Cyan

$commitMessage = @"
🔒 Security: Remove hardcoded credentials and add secure env var setup

- Remove hardcoded Supabase credentials from src/utils/config.ts
- Remove hardcoded Stripe keys from deploy-to-production.ps1
- Remove hardcoded database password from setup-cron-job script
- Add .env.example with safe placeholders (safe to commit)
- Update .gitignore to allow .env.example while ignoring actual .env files
- Add comprehensive security documentation

BREAKING: Production builds now require environment variables to be set.
All credentials must be configured via environment variables or deployment platform.
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Commit failed" -ForegroundColor Red
    exit 1
}

# Step 7: Ask about pushing
Write-Host ""
$pushConfirm = Read-Host "Do you want to push to remote repository? (y/n)"
if ($pushConfirm -ne "y" -and $pushConfirm -ne "Y") {
    Write-Host "ℹ️  Changes committed locally but not pushed" -ForegroundColor Yellow
    Write-Host "   Run 'git push origin $currentBranch' when ready" -ForegroundColor Yellow
    exit 0
}

# Step 8: Push
Write-Host ""
Write-Host "🚀 Pushing to remote repository..." -ForegroundColor Cyan
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to remote repository!" -ForegroundColor Green
    Write-Host "🎉 Security fixes are now in the remote repository" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Push failed" -ForegroundColor Red
    Write-Host "   You may need to:" -ForegroundColor Yellow
    Write-Host "   1. Set up remote: git remote add origin <url>" -ForegroundColor Yellow
    Write-Host "   2. Or pull first: git pull origin $currentBranch" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green

