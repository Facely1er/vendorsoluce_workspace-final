// Stripe Product Creation Script (Node.js ES Modules)
// File: create-stripe-products.js

import Stripe from 'stripe';
import fs from 'fs';

// Initialize Stripe with your secret key
// SECURITY: Never hardcode credentials. Always use environment variables.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required. Set it in your .env.local file or environment.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Product definitions
const products = [
  // Main Products
  {
    id: 'prod_starter',
    name: 'Starter',
    description: 'Perfect for small teams getting started with vendor compliance',
    prices: [
      { id: 'price_starter_monthly', amount: 4900, interval: 'month' },
      { id: 'price_starter_annual', amount: 47000, interval: 'year' }
    ]
  },
  {
    id: 'prod_starter_annual',
    name: 'Starter Annual',
    description: 'Perfect for small teams getting started with vendor compliance - Annual billing',
    prices: [
      { id: 'price_starter_annual', amount: 47000, interval: 'year' }
    ]
  },
  {
    id: 'prod_professional',
    name: 'Professional',
    description: 'Most popular choice for growing organizations',
    prices: [
      { id: 'price_professional_monthly', amount: 14900, interval: 'month' },
      { id: 'price_professional_annual', amount: 143000, interval: 'year' }
    ]
  },
  {
    id: 'prod_professional_annual',
    name: 'Professional Annual',
    description: 'Most popular choice for growing organizations - Annual billing',
    prices: [
      { id: 'price_professional_annual', amount: 143000, interval: 'year' }
    ]
  },
  {
    id: 'prod_enterprise',
    name: 'Enterprise',
    description: 'Complete solution for large organizations',
    prices: [
      { id: 'price_enterprise_monthly', amount: 44900, interval: 'month' },
      { id: 'price_enterprise_annual', amount: 431000, interval: 'year' }
    ]
  },
  {
    id: 'prod_enterprise_annual',
    name: 'Enterprise Annual',
    description: 'Complete solution for large organizations - Annual billing',
    prices: [
      { id: 'price_enterprise_annual', amount: 431000, interval: 'year' }
    ]
  },
  {
    id: 'prod_federal',
    name: 'Federal',
    description: 'FedRAMP compliant solution for government contractors',
    prices: [
      { id: 'price_federal_monthly', amount: 0, interval: 'month' },
      { id: 'price_federal_annual', amount: 0, interval: 'year' }
    ]
  },
  {
    id: 'prod_federal_annual',
    name: 'Federal Annual',
    description: 'FedRAMP compliant solution for government contractors - Annual billing',
    prices: [
      { id: 'price_federal_annual', amount: 0, interval: 'year' }
    ]
  },
  // Add-on Products
  {
    id: 'prod_additional_users',
    name: 'Additional Users',
    description: 'Add more users to your plan',
    prices: [
      { id: 'price_additional_users_monthly', amount: 500, interval: 'month' },
      { id: 'price_additional_users_annual', amount: 4800, interval: 'year' }
    ]
  },
  {
    id: 'prod_additional_users_annual',
    name: 'Additional Users Annual',
    description: 'Add more users to your annual plan',
    prices: [
      { id: 'price_additional_users_annual', amount: 4800, interval: 'year' }
    ]
  },
  {
    id: 'prod_additional_vendors',
    name: 'Additional Vendors',
    description: 'Add more vendors to your plan',
    prices: [
      { id: 'price_additional_vendors_monthly', amount: 200, interval: 'month' },
      { id: 'price_additional_vendors_annual', amount: 1900, interval: 'year' }
    ]
  },
  {
    id: 'prod_additional_vendors_annual',
    name: 'Additional Vendors Annual',
    description: 'Add more vendors to your annual plan',
    prices: [
      { id: 'price_additional_vendors_annual', amount: 1900, interval: 'year' }
    ]
  },
  {
    id: 'prod_compliance_consulting',
    name: 'Compliance Consulting',
    description: 'Expert compliance consulting services',
    prices: [
      { id: 'price_compliance_consulting_monthly', amount: 20000, interval: 'month' },
      { id: 'price_compliance_consulting_annual', amount: 192000, interval: 'year' }
    ]
  },
  {
    id: 'prod_compliance_consulting_annual',
    name: 'Compliance Consulting Annual',
    description: 'Expert compliance consulting services - Annual billing',
    prices: [
      { id: 'price_compliance_consulting_annual', amount: 192000, interval: 'year' }
    ]
  },
  {
    id: 'prod_white_label_branding',
    name: 'White-Label Branding',
    description: 'Custom branding and domain',
    prices: [
      { id: 'price_white_label_branding_monthly', amount: 5000, interval: 'month' },
      { id: 'price_white_label_branding_annual', amount: 48000, interval: 'year' }
    ]
  },
  {
    id: 'prod_white_label_branding_annual',
    name: 'White-Label Branding Annual',
    description: 'Custom branding and domain - Annual billing',
    prices: [
      { id: 'price_white_label_branding_annual', amount: 48000, interval: 'year' }
    ]
  },
  // Bundle Products
  {
    id: 'prod_compliance_suite',
    name: 'Compliance Suite',
    description: 'Complete compliance solution with consulting',
    prices: [
      { id: 'price_compliance_suite_monthly', amount: 29900, interval: 'month' },
      { id: 'price_compliance_suite_annual', amount: 287000, interval: 'year' }
    ]
  },
  {
    id: 'prod_compliance_suite_annual',
    name: 'Compliance Suite Annual',
    description: 'Complete compliance solution with consulting - Annual billing',
    prices: [
      { id: 'price_compliance_suite_annual', amount: 287000, interval: 'year' }
    ]
  },
  {
    id: 'prod_enterprise_plus',
    name: 'Enterprise Plus',
    description: 'Enterprise with premium add-ons',
    prices: [
      { id: 'price_enterprise_plus_monthly', amount: 69900, interval: 'month' },
      { id: 'price_enterprise_plus_annual', amount: 671000, interval: 'year' }
    ]
  },
  {
    id: 'prod_enterprise_plus_annual',
    name: 'Enterprise Plus Annual',
    description: 'Enterprise with premium add-ons - Annual billing',
    prices: [
      { id: 'price_enterprise_plus_annual', amount: 671000, interval: 'year' }
    ]
  }
];

async function createProducts() {
  console.log('🛍️ Creating Stripe Products and Prices...\n');
  
  const results = {
    products: [],
    prices: [],
    errors: []
  };

  for (const productData of products) {
    try {
      console.log(`Creating product: ${productData.name}`);
      
      // Create product
      const product = await stripe.products.create({
        id: productData.id,
        name: productData.name,
        description: productData.description,
        active: true
      });
      
      results.products.push(product);
      console.log(`✅ Product created: ${product.name} (${product.id})`);
      
      // Create prices for this product
      for (const priceData of productData.prices) {
        try {
          console.log(`  Creating price: ${priceData.id} ($${priceData.amount/100}/${priceData.interval})`);
          
          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: priceData.amount,
            currency: 'usd',
            recurring: {
              interval: priceData.interval
            },
            active: true
          });
          
          results.prices.push(price);
          console.log(`  ✅ Price created: ${price.id}`);
          
        } catch (priceError) {
          console.log(`  ❌ Price creation failed: ${priceError.message}`);
          results.errors.push({
            type: 'price',
            productId: productData.id,
            priceId: priceData.id,
            error: priceError.message
          });
        }
      }
      
    } catch (productError) {
      console.log(`❌ Product creation failed: ${productError.message}`);
      results.errors.push({
        type: 'product',
        productId: productData.id,
        error: productError.message
      });
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Save results to file
  fs.writeFileSync('stripe-products-creation-results.json', JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('📊 CREATION SUMMARY:');
  console.log(`✅ Products created: ${results.products.length}`);
  console.log(`✅ Prices created: ${results.prices.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(error => {
      console.log(`  - ${error.type}: ${error.productId || error.priceId} - ${error.error}`);
    });
  }
  
  console.log('\n🎉 Product creation completed!');
  console.log('📄 Results saved to: stripe-products-creation-results.json');
  
  return results;
}

// Run the script
createProducts().catch(console.error);

export { createProducts, products };
