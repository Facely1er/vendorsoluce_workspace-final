#!/usr/bin/env node

/**
 * Stripe Integration Test Script
 * This script verifies that all Stripe components are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Stripe Integration...\n');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

let totalTests = 0;
let passedTests = 0;
let warnings = [];

function testPass(message) {
  totalTests++;
  passedTests++;
  console.log(`${colors.green}✅ PASS${colors.reset}: ${message}`);
}

function testFail(message) {
  totalTests++;
  console.log(`${colors.red}❌ FAIL${colors.reset}: ${message}`);
}

function testWarn(message) {
  warnings.push(message);
  console.log(`${colors.yellow}⚠️  WARN${colors.reset}: ${message}`);
}

function sectionHeader(title) {
  console.log(`\n${colors.blue}━━━ ${title} ━━━${colors.reset}`);
}

// Test 1: Check environment variables
sectionHeader('Environment Variables');

const requiredEnvVars = [
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'VITE_STRIPE_PRICE_STARTER',
  'VITE_STRIPE_PRICE_PROFESSIONAL',
  'VITE_STRIPE_PRICE_ENTERPRISE',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  testPass('.env.local file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(varName)) {
      testPass(`${varName} is configured`);
    } else {
      testFail(`${varName} is missing`);
    }
  });
  
  // Check for test vs live keys
  if (envContent.includes('pk_test_')) {
    testWarn('Using TEST Stripe keys (not production)');
  }
  if (envContent.includes('pk_live_')) {
    testPass('Using LIVE Stripe keys (production ready)');
  }
} else {
  testFail('.env.local file not found');
}

// Test 2: Check Stripe configuration files
sectionHeader('Stripe Configuration Files');

const stripeFiles = [
  'src/config/stripe.ts',
  'src/lib/stripe.ts',
  'src/hooks/useSubscription.ts',
  'src/components/billing/CheckoutButton.tsx',
  'src/components/billing/SubscriptionManager.tsx',
  'src/components/billing/FeatureGate.tsx',
  'src/pages/BillingPage.tsx'
];

stripeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    testPass(`${file} exists`);
    
    // Check file content for common issues
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (file === 'src/config/stripe.ts') {
      if (content.includes('PRODUCTS')) {
        testPass('Product catalog configured in stripe.ts');
      } else {
        testFail('Product catalog missing in stripe.ts');
      }
      
      // Check pricing
      if (content.includes('price: 49') && content.includes('price: 149') && content.includes('price: 449')) {
        testPass('Pricing tiers correctly configured ($49, $149, $449)');
      } else {
        testWarn('Check pricing configuration in stripe.ts');
      }
    }
    
    if (file === 'src/lib/stripe.ts') {
      if (content.includes('loadStripe')) {
        testPass('Stripe SDK properly imported');
      } else {
        testFail('Stripe SDK import missing');
      }
    }
  } else {
    testFail(`${file} not found`);
  }
});

// Test 3: Check Supabase Edge Functions
sectionHeader('Supabase Edge Functions');

const edgeFunctions = [
  'supabase/functions/create-checkout-session/index.ts',
  'supabase/functions/stripe-webhook/index.ts',
  'supabase/functions/create-portal-session/index.ts'
];

edgeFunctions.forEach(func => {
  const funcPath = path.join(__dirname, func);
  if (fs.existsSync(funcPath)) {
    testPass(`${func} exists`);
    
    const content = fs.readFileSync(funcPath, 'utf8');
    if (content.includes('stripe.checkout.sessions.create') || 
        content.includes('stripe.webhooks.constructEvent') ||
        content.includes('stripe.billingPortal.sessions.create')) {
      testPass(`${path.basename(path.dirname(func))} has correct Stripe API calls`);
    } else {
      testWarn(`Check Stripe API implementation in ${func}`);
    }
  } else {
    testFail(`${func} not found`);
  }
});

// Test 4: Check database migration
sectionHeader('Database Migration');

const migrationPath = path.join(__dirname, 'supabase/migrations');
if (fs.existsSync(migrationPath)) {
  const migrations = fs.readdirSync(migrationPath);
  const stripeMigration = migrations.find(m => m.includes('stripe'));
  
  if (stripeMigration) {
    testPass(`Stripe migration found: ${stripeMigration}`);
    
    const migrationContent = fs.readFileSync(path.join(migrationPath, stripeMigration), 'utf8');
    const requiredTables = [
      'vs_customers',
      'vs_subscriptions',
      'vs_prices',
      'vs_invoices',
      'vs_usage_records'
    ];
    
    requiredTables.forEach(table => {
      if (migrationContent.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
        testPass(`Table ${table} defined in migration`);
      } else {
        testFail(`Table ${table} missing in migration`);
      }
    });
  } else {
    testFail('No Stripe migration file found');
  }
} else {
  testFail('Migrations directory not found');
}

// Test 5: Check Pricing Page Integration
sectionHeader('Pricing Page Integration');

const pricingPath = path.join(__dirname, 'src/pages/Pricing.tsx');
if (fs.existsSync(pricingPath)) {
  const pricingContent = fs.readFileSync(pricingPath, 'utf8');
  
  if (pricingContent.includes('CheckoutButton')) {
    testPass('CheckoutButton integrated in Pricing page');
  } else {
    testFail('CheckoutButton not found in Pricing page');
  }
  
  if (pricingContent.includes('import { PRODUCTS }')) {
    testPass('PRODUCTS imported from stripe config');
  } else {
    testWarn('PRODUCTS not imported - using static pricing');
  }
  
  // Check for each plan's checkout button
  ['starter', 'professional', 'enterprise'].forEach(plan => {
    if (pricingContent.includes(`plan="${plan}"`)) {
      testPass(`Checkout button configured for ${plan} plan`);
    } else {
      testFail(`Checkout button missing for ${plan} plan`);
    }
  });
} else {
  testFail('Pricing page not found');
}

// Test 6: Check Package Dependencies
sectionHeader('NPM Dependencies');

const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredDeps = {
    'stripe': 'Server-side Stripe SDK',
    '@stripe/stripe-js': 'Client-side Stripe SDK'
  };
  
  Object.entries(requiredDeps).forEach(([dep, description]) => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      testPass(`${dep} installed (${description})`);
    } else {
      testFail(`${dep} not installed - run: npm install ${dep}`);
    }
  });
} else {
  testFail('package.json not found');
}

// Test 7: Verify App Routes
sectionHeader('Application Routes');

const appPath = path.join(__dirname, 'src/App.tsx');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  if (appContent.includes('/billing') && appContent.includes('BillingPage')) {
    testPass('Billing route configured in App.tsx');
  } else {
    testFail('Billing route not found in App.tsx');
  }
} else {
  testFail('App.tsx not found');
}

// Final Report
console.log('\n' + '='.repeat(50));
console.log(`${colors.blue}📊 TEST SUMMARY${colors.reset}`);
console.log('='.repeat(50));

const percentage = Math.round((passedTests / totalTests) * 100);
const statusColor = percentage >= 80 ? colors.green : percentage >= 60 ? colors.yellow : colors.red;

console.log(`Tests Passed: ${statusColor}${passedTests}/${totalTests} (${percentage}%)${colors.reset}`);

if (warnings.length > 0) {
  console.log(`\n${colors.yellow}Warnings (${warnings.length}):${colors.reset}`);
  warnings.forEach(w => console.log(`  • ${w}`));
}

// Recommendations
console.log(`\n${colors.blue}📝 NEXT STEPS:${colors.reset}`);

if (percentage === 100) {
  console.log(`${colors.green}✨ Excellent! Stripe integration is fully configured.${colors.reset}`);
  console.log('\n1. Add your actual Stripe API keys to .env.local');
  console.log('2. Create products in Stripe Dashboard');
  console.log('3. Deploy Supabase Edge Functions');
  console.log('4. Run database migrations');
  console.log('5. Test checkout flow with Stripe test cards');
} else if (percentage >= 80) {
  console.log(`${colors.green}👍 Good! Most components are in place.${colors.reset}`);
  console.log('\nAddress the failed tests above to complete the integration.');
} else if (percentage >= 60) {
  console.log(`${colors.yellow}⚠️  Partial setup detected.${colors.reset}`);
  console.log('\nSeveral components need attention. Review failed tests above.');
} else {
  console.log(`${colors.red}❌ Significant setup required.${colors.reset}`);
  console.log('\nMany components are missing. Follow the setup guide to complete integration.');
}

console.log('\n' + '='.repeat(50));

// Exit with appropriate code
process.exit(passedTests === totalTests ? 0 : 1);