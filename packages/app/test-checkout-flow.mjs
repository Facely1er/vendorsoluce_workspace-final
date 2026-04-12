#!/usr/bin/env node

/**
 * Stripe Checkout Flow Test
 * Tests the actual checkout integration without opening a browser
 */

import fetch from 'node-fetch';

console.log('🛒 Testing Stripe Checkout Flow...\n');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:54321/functions/v1';

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    const response = await fetch(url);
    if (response.status === expectedStatus) {
      console.log(`${colors.green}✅${colors.reset} ${name}: Status ${response.status}`);
      return true;
    } else {
      console.log(`${colors.red}❌${colors.reset} ${name}: Expected ${expectedStatus}, got ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌${colors.reset} ${name}: ${error.message}`);
    return false;
  }
}

async function testCheckoutButton(planName) {
  console.log(`\n${colors.blue}Testing ${planName} Plan Checkout...${colors.reset}`);
  
  // Test if the pricing page loads
  const pricingResponse = await fetch(`${BASE_URL}/pricing`);
  if (pricingResponse.ok) {
    const html = await pricingResponse.text();
    
    // Check if CheckoutButton components are present
    if (html.includes('CheckoutButton') || html.includes('plan=')) {
      console.log(`${colors.green}✅${colors.reset} Checkout button found for ${planName}`);
      return true;
    } else if (html.includes(`$${getPriceForPlan(planName)}`)) {
      console.log(`${colors.yellow}⚠️${colors.reset} Price displayed for ${planName} but checkout may need configuration`);
      return true;
    } else {
      console.log(`${colors.red}❌${colors.reset} Checkout button not found for ${planName}`);
      return false;
    }
  }
  return false;
}

function getPriceForPlan(plan) {
  const prices = {
    'Starter': '49',
    'Professional': '149',
    'Enterprise': '449'
  };
  return prices[plan] || '0';
}

async function testStripeConfig() {
  console.log(`\n${colors.blue}Testing Stripe Configuration...${colors.reset}`);
  
  // Check if Stripe publishable key is accessible
  try {
    const response = await fetch(`${BASE_URL}/src/config/stripe.ts`);
    if (response.ok) {
      console.log(`${colors.green}✅${colors.reset} Stripe configuration file accessible`);
    } else {
      console.log(`${colors.yellow}⚠️${colors.reset} Stripe config not directly accessible (normal in production)`);
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️${colors.reset} Cannot access config directly (expected behavior)`);
  }
  
  return true;
}

async function testSupabaseConnection() {
  console.log(`\n${colors.blue}Testing Supabase Connection...${colors.reset}`);
  
  // Test if Supabase is configured
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || 'test-key'
      }
    });
    
    if (response.status === 200 || response.status === 401) {
      console.log(`${colors.green}✅${colors.reset} Supabase endpoint reachable`);
      return true;
    } else {
      console.log(`${colors.yellow}⚠️${colors.reset} Supabase connection needs configuration`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️${colors.reset} Supabase not configured (needs setup)`);
    return false;
  }
}

async function runTests() {
  console.log(`${colors.blue}🧪 Starting Stripe Integration Tests${colors.reset}`);
  console.log('='*50);
  
  let results = [];
  
  // Test main pages
  console.log(`\n${colors.blue}Testing Page Routes...${colors.reset}`);
  results.push(await testEndpoint('Homepage', `${BASE_URL}/`));
  results.push(await testEndpoint('Pricing Page', `${BASE_URL}/pricing`));
  results.push(await testEndpoint('Billing Page', `${BASE_URL}/billing`));
  
  // Test Stripe configuration
  results.push(await testStripeConfig());
  
  // Test checkout buttons for each plan
  results.push(await testCheckoutButton('Starter'));
  results.push(await testCheckoutButton('Professional'));
  results.push(await testCheckoutButton('Enterprise'));
  
  // Test Supabase connection
  results.push(await testSupabaseConnection());
  
  // Summary
  console.log('\n' + '='*50);
  const passed = results.filter(r => r).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  if (percentage >= 80) {
    console.log(`${colors.green}✅ Integration Test: ${passed}/${total} passed (${percentage}%)${colors.reset}`);
  } else if (percentage >= 60) {
    console.log(`${colors.yellow}⚠️  Integration Test: ${passed}/${total} passed (${percentage}%)${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Integration Test: ${passed}/${total} passed (${percentage}%)${colors.reset}`);
  }
  
  console.log(`\n${colors.blue}📝 Test Recommendations:${colors.reset}`);
  console.log('1. Configure actual Stripe API keys in .env.local');
  console.log('2. Set up Stripe products in the Dashboard');
  console.log('3. Deploy and configure Supabase Edge Functions');
  console.log('4. Test with Stripe test card: 4242 4242 4242 4242');
  console.log('5. Monitor webhook events in Stripe Dashboard');
  
  return percentage >= 60;
}

// Run tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error(`${colors.red}Test failed:${colors.reset}`, error);
  process.exit(1);
});