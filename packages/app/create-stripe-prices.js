// Stripe Price Creation Script for Existing Products
// File: create-stripe-prices.js

import Stripe from 'stripe';
import fs from 'fs';

// Initialize Stripe with your secret key
// SECURITY: Never hardcode credentials. Always use environment variables.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required. Set it in your .env.local file or environment.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Price definitions mapped to product IDs
const priceDefinitions = {
  'prod_starter': [
    { amount: 4900, interval: 'month', nickname: 'Starter Monthly' },
    { amount: 47000, interval: 'year', nickname: 'Starter Annual' }
  ],
  'prod_starter_annual': [
    { amount: 47000, interval: 'year', nickname: 'Starter Annual' }
  ],
  'prod_professional': [
    { amount: 14900, interval: 'month', nickname: 'Professional Monthly' },
    { amount: 143000, interval: 'year', nickname: 'Professional Annual' }
  ],
  'prod_professional_annual': [
    { amount: 143000, interval: 'year', nickname: 'Professional Annual' }
  ],
  'prod_enterprise': [
    { amount: 44900, interval: 'month', nickname: 'Enterprise Monthly' },
    { amount: 431000, interval: 'year', nickname: 'Enterprise Annual' }
  ],
  'prod_enterprise_annual': [
    { amount: 431000, interval: 'year', nickname: 'Enterprise Annual' }
  ],
  'prod_federal': [
    { amount: 0, interval: 'month', nickname: 'Federal Monthly' },
    { amount: 0, interval: 'year', nickname: 'Federal Annual' }
  ],
  'prod_federal_annual': [
    { amount: 0, interval: 'year', nickname: 'Federal Annual' }
  ],
  'prod_additional_users': [
    { amount: 500, interval: 'month', nickname: 'Additional Users Monthly' },
    { amount: 4800, interval: 'year', nickname: 'Additional Users Annual' }
  ],
  'prod_additional_users_annual': [
    { amount: 4800, interval: 'year', nickname: 'Additional Users Annual' }
  ],
  'prod_additional_vendors': [
    { amount: 200, interval: 'month', nickname: 'Additional Vendors Monthly' },
    { amount: 1900, interval: 'year', nickname: 'Additional Vendors Annual' }
  ],
  'prod_additional_vendors_annual': [
    { amount: 1900, interval: 'year', nickname: 'Additional Vendors Annual' }
  ],
  'prod_compliance_consulting': [
    { amount: 20000, interval: 'month', nickname: 'Compliance Consulting Monthly' },
    { amount: 192000, interval: 'year', nickname: 'Compliance Consulting Annual' }
  ],
  'prod_compliance_consulting_annual': [
    { amount: 192000, interval: 'year', nickname: 'Compliance Consulting Annual' }
  ],
  'prod_white_label_branding': [
    { amount: 5000, interval: 'month', nickname: 'White-Label Branding Monthly' },
    { amount: 48000, interval: 'year', nickname: 'White-Label Branding Annual' }
  ],
  'prod_white_label_branding_annual': [
    { amount: 48000, interval: 'year', nickname: 'White-Label Branding Annual' }
  ],
  'prod_compliance_suite': [
    { amount: 29900, interval: 'month', nickname: 'Compliance Suite Monthly' },
    { amount: 287000, interval: 'year', nickname: 'Compliance Suite Annual' }
  ],
  'prod_compliance_suite_annual': [
    { amount: 287000, interval: 'year', nickname: 'Compliance Suite Annual' }
  ],
  'prod_enterprise_plus': [
    { amount: 69900, interval: 'month', nickname: 'Enterprise Plus Monthly' },
    { amount: 671000, interval: 'year', nickname: 'Enterprise Plus Annual' }
  ],
  'prod_enterprise_plus_annual': [
    { amount: 671000, interval: 'year', nickname: 'Enterprise Plus Annual' }
  ]
};

async function createPricesForExistingProducts() {
  console.log('💰 Creating Stripe Prices for Existing Products...\n');
  
  const results = {
    products: [],
    prices: [],
    errors: []
  };

  // Get all existing products
  const products = await stripe.products.list({ limit: 100 });
  console.log(`Found ${products.data.length} existing products\n`);

  for (const product of products.data) {
    const priceDefs = priceDefinitions[product.id];
    
    if (!priceDefs) {
      console.log(`⚠️  No price definitions found for product: ${product.name} (${product.id})`);
      continue;
    }

    console.log(`Creating prices for: ${product.name} (${product.id})`);
    
    // Check existing prices for this product
    const existingPrices = await stripe.prices.list({ product: product.id });
    console.log(`  Found ${existingPrices.data.length} existing prices`);

    for (const priceDef of priceDefs) {
      // Check if price already exists
      const existingPrice = existingPrices.data.find(p => 
        p.unit_amount === priceDef.amount && 
        p.recurring?.interval === priceDef.interval
      );

      if (existingPrice) {
        console.log(`  ✅ Price already exists: ${existingPrice.id} ($${priceDef.amount/100}/${priceDef.interval})`);
        results.prices.push(existingPrice);
        continue;
      }

      try {
        console.log(`  Creating price: $${priceDef.amount/100}/${priceDef.interval}`);
        
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: priceDef.amount,
          currency: 'usd',
          recurring: {
            interval: priceDef.interval
          },
          nickname: priceDef.nickname,
          active: true
        });
        
        results.prices.push(price);
        console.log(`  ✅ Price created: ${price.id}`);
        
      } catch (priceError) {
        console.log(`  ❌ Price creation failed: ${priceError.message}`);
        results.errors.push({
          type: 'price',
          productId: product.id,
          priceDef,
          error: priceError.message
        });
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Save results to file
  fs.writeFileSync('stripe-prices-creation-results.json', JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('📊 PRICE CREATION SUMMARY:');
  console.log(`✅ Products processed: ${products.data.length}`);
  console.log(`✅ Prices created/found: ${results.prices.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(error => {
      console.log(`  - ${error.type}: ${error.productId} - ${error.error}`);
    });
  }
  
  // Create a mapping file for easy reference
  const priceMapping = {};
  results.prices.forEach(price => {
    const productId = price.product;
    if (!priceMapping[productId]) {
      priceMapping[productId] = [];
    }
    priceMapping[productId].push({
      id: price.id,
      amount: price.unit_amount,
      interval: price.recurring?.interval,
      nickname: price.nickname
    });
  });
  
  fs.writeFileSync('stripe-price-mapping.json', JSON.stringify(priceMapping, null, 2));
  
  console.log('\n🎉 Price creation completed!');
  console.log('📄 Results saved to: stripe-prices-creation-results.json');
  console.log('📄 Price mapping saved to: stripe-price-mapping.json');
  
  return results;
}

// Run the script
createPricesForExistingProducts().catch(console.error);

export { createPricesForExistingProducts, priceDefinitions };
