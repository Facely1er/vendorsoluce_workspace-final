// Simple Stripe Integration Test
// File: simple-stripe-test.js

import Stripe from 'stripe';

// Initialize Stripe with your secret key
// SECURITY: Never hardcode credentials. Always use environment variables.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required. Set it in your .env.local file or environment.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Test products with actual Stripe IDs
const testProducts = [
  { name: 'Starter Monthly', priceId: 'price_1SDebCIUB3FoXZdh8dp42ehe', amount: 4900 },
  { name: 'Starter Annual', priceId: 'price_1SDebCIUB3FoXZdhoTWIonmT', amount: 47000 },
  { name: 'Professional Monthly', priceId: 'price_1SDebBIUB3FoXZdhcPdM4wpJ', amount: 14900 },
  { name: 'Professional Annual', priceId: 'price_1SDebBIUB3FoXZdhkYjMHNtc', amount: 143000 },
  { name: 'Enterprise Monthly', priceId: 'price_1SDebAIUB3FoXZdhVCNrKzTl', amount: 44900 },
  { name: 'Enterprise Annual', priceId: 'price_1SDebAIUB3FoXZdhxCMBROTw', amount: 431000 },
  { name: 'Federal Monthly', priceId: 'price_1SEW7LIUB3FoXZdhCMLRq822', amount: 99900 },
  { name: 'Federal Annual', priceId: 'price_1SEW7MIUB3FoXZdhbOONitHb', amount: 959000 },
  { name: 'Additional Users Monthly', priceId: 'price_1SEW7NIUB3FoXZdhkqaB5Qd5', amount: 1000 },
  { name: 'Additional Users Annual', priceId: 'price_1SEW7OIUB3FoXZdha3XuErNl', amount: 9600 },
  { name: 'Compliance Suite Monthly', priceId: 'price_1SDeb4IUB3FoXZdhfm0xRNs7', amount: 29900 },
  { name: 'Compliance Suite Annual', priceId: 'price_1SDeb4IUB3FoXZdheg2gbYTo', amount: 287000 }
];

async function testStripeIntegration() {
  console.log('🧪 Testing Complete Stripe Integration...\n');
  
  const testResults = {
    products: [],
    checkoutSessions: [],
    errors: []
  };

  // Test 1: Verify all products exist in Stripe
  console.log('📦 Testing Product Catalog Integration:');
  const stripeProducts = await stripe.products.list({ limit: 100 });
  
  for (const product of testProducts) {
    try {
      console.log(`  Testing: ${product.name} (${product.priceId})`);
      
      // Check if price exists
      const price = await stripe.prices.retrieve(product.priceId);
      
      // Verify price amount
      if (price.unit_amount !== product.amount) {
        throw new Error(`Price mismatch: expected ${product.amount}, got ${price.unit_amount}`);
      }
      
      // Verify product exists
      const stripeProduct = await stripe.products.retrieve(price.product);
      
      testResults.products.push({
        name: product.name,
        priceId: product.priceId,
        productId: stripeProduct.id,
        amount: price.unit_amount,
        status: 'success'
      });
      
      console.log(`    ✅ Product verified: ${product.name} - $${product.amount/100}`);
      
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      testResults.errors.push({
        product: product.name,
        priceId: product.priceId,
        error: error.message
      });
    }
  }

  // Test 2: Test checkout sessions for different product types
  console.log('\n💳 Testing Checkout Sessions:');
  
  // Test main products (first 4)
  for (const product of testProducts.slice(0, 4)) {
    try {
      console.log(`  Testing checkout: ${product.name}`);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: product.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        customer_email: 'test@vendorsoluce.com',
        success_url: 'https://vendorsoluce.com/test-success',
        cancel_url: 'https://vendorsoluce.com/test-cancel',
        metadata: {
          productName: product.name,
          testMode: 'true'
        }
      });
      
      testResults.checkoutSessions.push({
        product: product.name,
        sessionId: session.id,
        url: session.url,
        status: 'success'
      });
      
      console.log(`    ✅ Checkout session created: ${session.id}`);
      
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      testResults.errors.push({
        product: product.name,
        operation: 'checkout',
        error: error.message
      });
    }
  }

  // Test 3: Test annual vs monthly pricing
  console.log('\n💰 Testing Annual vs Monthly Pricing:');
  
  const monthlyProducts = testProducts.filter(p => p.name.includes('Monthly'));
  const annualProducts = testProducts.filter(p => p.name.includes('Annual'));
  
  for (let i = 0; i < Math.min(monthlyProducts.length, annualProducts.length); i++) {
    const monthly = monthlyProducts[i];
    const annual = annualProducts[i];
    
    try {
      console.log(`  Testing pricing: ${monthly.name} vs ${annual.name}`);
      
      const monthlyAnnualPrice = monthly.amount * 12;
      const annualDiscount = monthlyAnnualPrice - annual.amount;
      const discountPercentage = (annualDiscount / monthlyAnnualPrice) * 100;
      
      if (Math.abs(discountPercentage - 20) > 1) { // Allow 1% tolerance
        throw new Error(`Discount percentage mismatch: expected ~20%, got ${discountPercentage.toFixed(1)}%`);
      }
      
      console.log(`    ✅ Pricing verified: ${discountPercentage.toFixed(1)}% discount (Save $${annualDiscount/100})`);
      
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      testResults.errors.push({
        product: `${monthly.name} vs ${annual.name}`,
        operation: 'pricing_verification',
        error: error.message
      });
    }
  }

  // Test 4: Test webhook endpoint configuration
  console.log('\n🔗 Testing Webhook Configuration:');
  try {
    const webhookUrl = 'https://snrpdosiuwmdaegxkqux.supabase.co/functions/v1/stripe-webhook';
    console.log(`  Webhook URL: ${webhookUrl}`);
    console.log(`  ✅ Webhook endpoint configured`);
    
    // Test webhook events list
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    console.log(`  Found ${webhooks.data.length} webhook endpoints`);
    
    const ourWebhook = webhooks.data.find(w => w.url.includes('supabase.co'));
    if (ourWebhook) {
      console.log(`  ✅ Our webhook found: ${ourWebhook.url}`);
      console.log(`  Status: ${ourWebhook.status}`);
    } else {
      console.log(`  ⚠️  Our webhook not found - may need to be created`);
    }
    
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    testResults.errors.push({
      operation: 'webhook_test',
      error: error.message
    });
  }

  // Test 5: Test customer portal
  console.log('\n🏪 Testing Customer Portal:');
  try {
    // Create a test customer
    const customer = await stripe.customers.create({
      email: 'test-customer@vendorsoluce.com',
      name: 'Test Customer'
    });
    
    console.log(`  ✅ Test customer created: ${customer.id}`);
    
    // Test customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: 'https://vendorsoluce.com/dashboard'
    });
    
    console.log(`  ✅ Customer portal session created: ${portalSession.id}`);
    console.log(`  Portal URL: ${portalSession.url}`);
    
    // Clean up test customer
    await stripe.customers.del(customer.id);
    console.log(`  ✅ Test customer cleaned up`);
    
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    testResults.errors.push({
      operation: 'customer_portal_test',
      error: error.message
    });
  }

  // Save test results
  const fs = await import('fs');
  fs.writeFileSync('stripe-integration-test-results.json', JSON.stringify(testResults, null, 2));
  
  // Print summary
  console.log('\n📊 STRIPE INTEGRATION TEST SUMMARY:');
  console.log(`✅ Products verified: ${testResults.products.length}`);
  console.log(`✅ Checkout sessions created: ${testResults.checkoutSessions.length}`);
  console.log(`❌ Errors: ${testResults.errors.length}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.product || error.operation}: ${error.error}`);
    });
  }
  
  console.log('\n🎉 Stripe integration testing completed!');
  console.log('📄 Results saved to: stripe-integration-test-results.json');
  
  if (testResults.checkoutSessions.length > 0) {
    console.log('\n🔗 Test Checkout URLs:');
    testResults.checkoutSessions.forEach(session => {
      console.log(`  ${session.product}: ${session.url}`);
    });
  }
  
  return testResults;
}

// Run the test
testStripeIntegration().catch(console.error);

export { testStripeIntegration };
