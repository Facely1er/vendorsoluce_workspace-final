// Update Stripe Price IDs in Product Catalog
// File: update-price-ids.js

import fs from 'fs';

// Read the price mapping
const priceMapping = JSON.parse(fs.readFileSync('stripe-price-mapping.json', 'utf8'));

// Read the current stripeProducts.ts file
let stripeProductsContent = fs.readFileSync('src/lib/stripeProducts.ts', 'utf8');

// Create a mapping of our product IDs to Stripe price IDs
const priceIdMapping = {
  'price_starter_monthly': 'price_1SDebCIUB3FoXZdh8dp42ehe',
  'price_starter_annual': 'price_1SDebCIUB3FoXZdhoTWIonmT',
  'price_professional_monthly': 'price_1SDebBIUB3FoXZdhcPdM4wpJ',
  'price_professional_annual': 'price_1SDebBIUB3FoXZdhkYjMHNtc',
  'price_enterprise_monthly': 'price_1SDebAIUB3FoXZdhVCNrKzTl',
  'price_enterprise_annual': 'price_1SDebAIUB3FoXZdhxCMBROTw',
  'price_federal_monthly': 'price_1SDeb9IUB3FoXZdhzIA6mzZN',
  'price_federal_annual': 'price_1SDeb9IUB3FoXZdhhOn1aCgE',
  'price_additional_users_monthly': 'price_1SDeb8IUB3FoXZdhqpR5LPZf',
  'price_additional_users_annual': 'price_1SDeb8IUB3FoXZdhbJcS7CeL',
  'price_additional_vendors_monthly': 'price_1SDeb7IUB3FoXZdhZy1NxkUb',
  'price_additional_vendors_annual': 'price_1SDeb7IUB3FoXZdhIIop7wuC',
  'price_compliance_consulting_monthly': 'price_1SDeb6IUB3FoXZdhvMWpC2wD',
  'price_compliance_consulting_annual': 'price_1SDeb6IUB3FoXZdhx3gbyyVI',
  'price_white_label_branding_monthly': 'price_1SDeb5IUB3FoXZdhhyykch2G',
  'price_white_label_branding_annual': 'price_1SDeb5IUB3FoXZdhPQReXHuc',
  'price_compliance_suite_monthly': 'price_1SDeb4IUB3FoXZdhfm0xRNs7',
  'price_compliance_suite_annual': 'price_1SDeb4IUB3FoXZdheg2gbYTo',
  'price_enterprise_plus_monthly': 'price_1SDeb3IUB3FoXZdhAiZ0Cryw',
  'price_enterprise_plus_annual': 'price_1SDeb3IUB3FoXZdhQHPKzfEy'
};

// Update all price IDs in the file
Object.entries(priceIdMapping).forEach(([oldId, newId]) => {
  const regex = new RegExp(`'${oldId}'`, 'g');
  stripeProductsContent = stripeProductsContent.replace(regex, `'${newId}'`);
});

// Write the updated content back to the file
fs.writeFileSync('src/lib/stripeProducts.ts', stripeProductsContent);

console.log('✅ Updated all Stripe price IDs in stripeProducts.ts');
console.log('📊 Updated price IDs:');
Object.entries(priceIdMapping).forEach(([oldId, newId]) => {
  console.log(`  ${oldId} → ${newId}`);
});
