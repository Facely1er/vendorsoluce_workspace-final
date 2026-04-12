#!/bin/bash

# VendorSoluce Quick Production Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting VendorSoluce Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Step 3: Type check
print_status "Running type check..."
if npm run type-check; then
    print_success "Type checking passed"
else
    print_error "Type checking failed. Please fix TypeScript errors before deployment."
    exit 1
fi

# Step 4: Build for production
print_status "Building for production..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed. Please fix build errors before deployment."
    exit 1
fi

# Step 5: Verify build output
print_status "Verifying build output..."
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    print_success "Build output verified. Size: $DIST_SIZE"
else
    print_error "Build output directory 'dist' not found."
    exit 1
fi

# Step 6: Deploy to Vercel
print_status "Deploying to Vercel production..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to production
if vercel --prod --token GHgsANNuU3amkHubJLSnSoOU; then
    print_success "Deployment completed successfully!"
else
    print_error "Deployment failed. Please check the error messages above."
    exit 1
fi

# Step 7: Post-deployment summary
echo
print_success "🎉 VendorSoluce is now live in production!"
echo
print_status "Next steps:"
echo "1. Verify the deployment in Vercel Dashboard"
echo "2. Test all critical user flows"
echo "3. Monitor error rates (Sentry)"
echo "4. Monitor performance metrics"
echo "5. Check Stripe webhook events"
echo

print_success "Deployment script completed successfully!"

