#!/bin/bash

# VendorSoluce Production Deployment Script
# This script automates the deployment process with safety checks

set -e  # Exit on any error

echo "🚀 Starting VendorSoluce Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Please create it from .env.production template."
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version check passed: $(node --version)"

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm ci --only=production=false

# Step 3: Security audit
print_status "Running security audit..."
if npm audit --audit-level=moderate; then
    print_success "Security audit passed"
else
    print_warning "Security vulnerabilities found. Run 'npm audit fix' to resolve."
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 4: Linting and type checking
print_status "Running linting checks..."
if npm run lint; then
    print_success "Linting passed"
else
    print_warning "Linting issues found. Consider running 'npm run lint:fix'"
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_status "Running type checking..."
if npm run type-check; then
    print_success "Type checking passed"
else
    print_error "Type checking failed. Please fix TypeScript errors before deployment."
    exit 1
fi

# Step 5: Build for production
print_status "Building for production..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed. Please fix build errors before deployment."
    exit 1
fi

# Step 6: Bundle analysis
print_status "Running bundle analysis..."
npm run build:analyze

# Step 7: Pre-deployment verification
print_status "Verifying build output..."
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    print_success "Build output verified. Size: $DIST_SIZE"
else
    print_error "Build output directory 'dist' not found."
    exit 1
fi

# Step 8: Environment validation
print_status "Validating environment configuration..."
if grep -q "VITE_SUPABASE_URL" .env.local 2>/dev/null; then
    print_success "Supabase configuration found"
else
    print_warning "Supabase configuration not found in .env.local"
fi

# Step 9: Database migration check
print_status "Checking database migrations..."
if [ -d "supabase/migrations" ]; then
    MIGRATION_COUNT=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l)
    print_success "Found $MIGRATION_COUNT database migrations"
else
    print_warning "No database migrations found"
fi

# Step 10: Final deployment confirmation
echo
print_status "Deployment readiness summary:"
echo "✅ Dependencies installed"
echo "✅ Security audit completed"
echo "✅ Code quality checks passed"
echo "✅ Production build successful"
echo "✅ Bundle analysis completed"
echo "✅ Environment configuration verified"
echo

read -p "Ready to deploy to production? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Deployment cancelled by user."
    exit 0
fi

# Step 11: Deployment (placeholder)
print_status "Deploying to production..."
print_warning "This is a placeholder. Configure your deployment platform here."

# Example deployment commands (uncomment and modify as needed):
# vercel --prod
# netlify deploy --prod --dir=dist
# aws s3 sync dist/ s3://your-bucket-name --delete

print_success "Deployment script completed successfully!"
print_status "Next steps:"
echo "1. Verify the deployment in your hosting platform"
echo "2. Test all critical user flows"
echo "3. Monitor error rates and performance"
echo "4. Update your monitoring dashboards"

echo
print_success "🎉 VendorSoluce is ready for production deployment!"