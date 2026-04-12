// Fix Stripe Price Mismatches Script
// File: fix-price-mismatches.js

import Stripe from 'stripe';

// Initialize Stripe with your secret key
// SECURITY: Never hardcode credentials. Always use environment variables.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required. Set it in your .env.local file or environment.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Products that need price fixes
const priceFixes = [
  {
    name: 'Federal Monthly',
    currentPriceId: 'price_1SDeb9IUB3FoXZdhzIA6mzZN',
    correctAmount: 99900, // $999.00
    description: 'Government-grade compliance for federal contractors - Monthly billing'
  },
  {
    name: 'Federal Annual',
    currentPriceId: 'price_1SDeb9IUB3FoXZdhhOn1aCgE',
    correctAmount: 959000, // $9,590.00
    description: 'Government-grade compliance for federal contractors - Annual billing (Save 20%)'
  },
  {
    name: 'Additional Users Monthly',
    currentPriceId: 'price_1SDeb8IUB3FoXZdhqpR5LPZf',
    correctAmount: 1000, // $10.00
    description: 'Add more team members to your plan - Monthly billing'
  },
  {
    name: 'Additional Users Annual',
    currentPriceId: 'price_1SDeb8IUB3FoXZdhbJcS7CeL',
    correctAmount: 9600, // $96.00
    description: 'Add more team members to your plan - Annual billing (Save 20%)'
  }
];

async function fixPriceMismatches() {
  console.log('🔧 Fixing Stripe Price Mismatches...\n');
  
  const results = {
    fixed: [],
    errors: []
  };

  for (const fix of priceFixes) {
    try {
      console.log(`Fixing: ${fix.name}`);
      
      // Get current price details
      const currentPrice = await stripe.prices.retrieve(fix.currentPriceId);
      console.log(`  Current amount: $${currentPrice.unit_amount / 100}`);
      console.log(`  Target amount: $${fix.correctAmount / 100}`);
      
      if (currentPrice.unit_amount === fix.correctAmount) {
        console.log(`  ✅ Price already correct`);
        results.fixed.push({
          name: fix.name,
          priceId: fix.currentPriceId,
          status: 'already_correct'
        });
        continue;
      }
      
      // Get the product
      const product = await stripe.products.retrieve(currentPrice.product);
      console.log(`  Product: ${product.name}`);
      
      // Create new price with correct amount
      const newPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: fix.correctAmount,
        currency: 'usd',
        recurring: {
          interval: currentPrice.recurring?.interval || 'month',
        },
        active: true,
        nickname: fix.name
      });
      
      console.log(`  ✅ New price created: ${newPrice.id} - $${fix.correctAmount / 100}`);
      
      // Archive the old price
      await stripe.prices.update(fix.currentPriceId, {
        active: false
      });
      
      console.log(`  ✅ Old price archived: ${fix.currentPriceId}`);
      
      results.fixed.push({
        name: fix.name,
        oldPriceId: fix.currentPriceId,
        newPriceId: newPrice.id,
        amount: fix.correctAmount,
        status: 'fixed'
      });
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      results.errors.push({
        name: fix.name,
        priceId: fix.currentPriceId,
        error: error.message
      });
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Save results
  const fs = await import('fs');
  fs.writeFileSync('price-fix-results.json', JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('📊 PRICE FIX SUMMARY:');
  console.log(`✅ Prices fixed: ${results.fixed.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(error => {
      console.log(`  - ${error.name}: ${error.error}`);
    });
  }
  
  console.log('\n🎉 Price mismatch fixing completed!');
  console.log('📄 Results saved to: price-fix-results.json');
  
  // Generate updated product catalog
  if (results.fixed.length > 0) {
    console.log('\n📝 Updated Price IDs:');
    results.fixed.forEach(fix => {
      if (fix.status === 'fixed') {
        console.log(`  ${fix.name}: ${fix.newPriceId}`);
      }
    });
  }
  
  return results;
}

// Run the fix
fixPriceMismatches().catch(console.error);

export { fixPriceMismatches };
