// Simple Stripe Checkout Test Script
// File: simple-checkout-test.js

import Stripe from 'stripe';

// Initialize Stripe with your secret key
// SECURITY: Never hardcode credentials. Always use environment variables.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required. Set it in your .env.local file or environment.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Test price IDs from our created products
const testPrices = [
  { name: 'Starter Monthly', priceId: 'price_1SDebCIUB3FoXZdh8dp42ehe', amount: 4900 },
  { name: 'Starter Annual', priceId: 'price_1SDebCIUB3FoXZdhoTWIonmT', amount: 47000 },
  { name: 'Professional Monthly', priceId: 'price_1SDebBIUB3FoXZdhcPdM4wpJ', amount: 14900 },
  { name: 'Professional Annual', priceId: 'price_1SDebBIUB3FoXZdhkYjMHNtc', amount: 143000 },
  { name: 'Enterprise Monthly', priceId: 'price_1SDebAIUB3FoXZdhVCNrKzTl', amount: 44900 },
  { name: 'Enterprise Annual', priceId: 'price_1SDebAIUB3FoXZdhxCMBROTw', amount: 431000 },
  { name: 'Compliance Suite Monthly', priceId: 'price_1SDeb4IUB3FoXZdhfm0xRNs7', amount: 29900 },
  { name: 'Compliance Suite Annual', priceId: 'price_1SDeb4IUB3FoXZdheg2gbYTo', amount: 287000 }
];

async function testCheckoutFlow() {
  console.log('🧪 Testing Stripe Checkout Flow...\n');
  
  const testResults = {
    products: [],
    errors: []
  };

  for (const testPrice of testPrices) {
    try {
      console.log(`Testing: ${testPrice.name} ($${testPrice.amount/100})`);
      
      // Create a test checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: testPrice.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        customer_email: 'test@vendorsoluce.com',
        success_url: 'https://vendorsoluce.com/test-success',
        cancel_url: 'https://vendorsoluce.com/test-cancel',
        metadata: {
          productName: testPrice.name,
          testMode: 'true'
        }
      });
      
      testResults.products.push({
        name: testPrice.name,
        priceId: testPrice.priceId,
        sessionId: session.id,
        url: session.url,
        status: 'success'
      });
      
      console.log(`  ✅ Checkout session created: ${session.id}`);
      console.log(`  🔗 Test URL: ${session.url}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      testResults.errors.push({
        product: testPrice.name,
        priceId: testPrice.priceId,
        error: error.message
      });
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Save test results
  const fs = await import('fs');
  fs.writeFileSync('checkout-test-results.json', JSON.stringify(testResults, null, 2));
  
  // Print summary
  console.log('📊 CHECKOUT TEST SUMMARY:');
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
  
  if (testResults.products.length > 0) {
    console.log('\n🔗 Test URLs (click to test checkout):');
    testResults.products.forEach(product => {
      console.log(`  ${product.name}: ${product.url}`);
    });
  }
  
  return testResults;
}

// Run the test
testCheckoutFlow().catch(console.error);

export { testCheckoutFlow };
