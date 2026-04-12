#!/bin/bash
# Demo Build Script for Linux/Mac
# This script builds the demo version of VendorSoluce

set -e

echo "🚀 Building Demo Version..."

# Check if .env.demo exists
if [ ! -f ".env.demo" ]; then
    echo "⚠️  Warning: .env.demo file not found!"
    echo "📝 Creating .env.demo from template..."
    cp .env.demo.example .env.demo
    echo "✅ Created .env.demo - Please edit it with your demo credentials"
    echo ""
fi

# Load environment variables from .env.demo
if [ -f ".env.demo" ]; then
    echo "📋 Loading environment variables from .env.demo..."
    export $(grep -v '^#' .env.demo | xargs)
fi

# Run type check
echo ""
echo "🔍 Running TypeScript type check..."
npm run type-check

# Build demo version
echo ""
echo "🔨 Building demo version..."
export BUILD_MODE=demo
npm run build:demo

echo ""
echo "✅ Demo build completed successfully!"
echo "📦 Output directory: dist-demo/"
echo ""
echo "To preview locally, run:"
echo "  npm run preview:demo"
echo ""

