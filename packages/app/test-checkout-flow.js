// Stripe Checkout Test Script
// File: test-checkout-flow.js

import Stripe from 'stripe';
import { getMainProducts, getAddonProducts, getBundleProducts } from './src/lib/stripeProducts.ts';

// Initialize Stripe with your secret key
// SECURITY: Never hardcode credentials. Always use environment variables.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required. Set it in your .env.local file or environment.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testCheckoutFlow() {
  console.log('🧪 Testing Stripe Checkout Flow...\n');
  
  const testResults = {
    products: [],
    errors: []
  };

  // Test main products
  console.log('📦 Testing Main Products:');
  const mainProducts = getMainProducts('month');
  
  for (const product of mainProducts) {
    try {
      console.log(`  Testing: ${product.name} (${product.stripePriceId})`);
      
      // Create a test checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: product.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        customer_email: 'test@vendorsoluce.com',
        success_url: 'https://vendorsoluce.com/test-success',
        cancel_url: 'https://vendorsoluce.com/test-cancel',
        metadata: {
          productId: product.id,
          testMode: 'true'
        }
      });
      
      testResults.products.push({
        name: product.name,
        priceId: product.stripePriceId,
        sessionId: session.id,
        url: session.url,
        status: 'success'
      });
      
      console.log(`    ✅ Checkout session created: ${session.id}`);
      
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      testResults.errors.push({
        product: product.name,
        priceId: product.stripePriceId,
        error: error.message
      });
    }
  }
  
  console.log('\n📦 Testing Annual Products:');
  const annualProducts = getMainProducts('year');
  
  for (const product of annualProducts) {
    try {
      console.log(`  Testing: ${product.name} (${product.stripePriceId})`);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: product.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        customer_email: 'test@vendorsoluce.com',
        success_url: 'https://vendorsoluce.com/test-success',
        cancel_url: 'https://vendorsoluce.com/test-cancel',
        metadata: {
          productId: product.id,
          testMode: 'true'
        }
      });
      
      testResults.products.push({
        name: product.name,
        priceId: product.stripePriceId,
        sessionId: session.id,
        url: session.url,
        status: 'success'
      });
      
      console.log(`    ✅ Checkout session created: ${session.id}`);
      
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      testResults.errors.push({
        product: product.name,
        priceId: product.stripePriceId,
        error: error.message
      });
    }
  }
  
  console.log('\n🎁 Testing Bundle Products:');
  const bundleProducts = getBundleProducts('month');
  
  for (const product of bundleProducts) {
    try {
      console.log(`  Testing: ${product.name} (${product.stripePriceId})`);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: product.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        customer_email: 'test@vendorsoluce.com',
        success_url: 'https://vendorsoluce.com/test-success',
        cancel_url: 'https://vendorsoluce.com/test-cancel',
        metadata: {
          productId: product.id,
          testMode: 'true'
        }
      });
      
      testResults.products.push({
        name: product.name,
        priceId: product.stripePriceId,
        sessionId: session.id,
        url: session.url,
        status: 'success'
      });
      
      console.log(`    ✅ Checkout session created: ${session.id}`);
      
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      testResults.errors.push({
        product: product.name,
        priceId: product.stripePriceId,
        error: error.message
      });
    }
  }
  
  // Save test results
  const fs = await import('fs');
  fs.writeFileSync('checkout-test-results.json', JSON.stringify(testResults, null, 2));
  
  // Print summary
  console.log('\n📊 CHECKOUT TEST SUMMARY:');
  console.log(`✅ Successful sessions: ${testResults.products.length}`);
  console.log(`❌ Errors: ${testResults.errors.length}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.product}: ${error.error}`);
    });
  }
  
  console.log('\n🎉 Checkout flow testing completed!');
  console.log('📄 Results saved to: checkout-test-results.json');
  
  return testResults;
}

// Run the test
testCheckoutFlow().catch(console.error);

export { testCheckoutFlow };
