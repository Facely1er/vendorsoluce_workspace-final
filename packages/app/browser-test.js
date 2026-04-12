/**
 * Browser Console Test Script
 * 
 * Copy and paste this into the browser console (F12) on each deployed site
 * to verify the product configuration is working correctly.
 */

console.log('🔍 VendorSoluce Product Verification Test');
console.log('==========================================\n');

// Check current environment
const appEnv = import.meta.env.VITE_APP_ENV || 'development';
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
const appName = import.meta.env.VITE_APP_NAME || 'VendorSoluce';

console.log('1. Application Configuration:');
console.log('   Environment:', appEnv);
console.log('   Version:', appVersion);
console.log('   Name:', appName);

// Check Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('\n2. Supabase Configuration:');
if (supabaseUrl) {
  console.log('✅ Supabase URL:', supabaseUrl.substring(0, 30) + '...');
} else {
  console.log('❌ Supabase URL: NOT SET');
}

if (supabaseKey) {
  console.log('✅ Supabase Anon Key:', supabaseKey.substring(0, 20) + '...');
} else {
  console.log('❌ Supabase Anon Key: NOT SET');
}

// Check Stripe configuration
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

console.log('\n3. Stripe Configuration:');
if (stripeKey) {
  const isLive = stripeKey.startsWith('pk_live_');
  const isTest = stripeKey.startsWith('pk_test_');
  console.log('✅ Stripe Publishable Key:', isLive ? 'LIVE' : isTest ? 'TEST' : 'UNKNOWN', 'mode');
  console.log('   Key:', stripeKey.substring(0, 20) + '...');
} else {
  console.log('⚠️  Stripe Publishable Key: NOT SET (optional for non-payment features)');
}

// Check feature flags
const vendorAssessments = import.meta.env.VITE_ENABLE_VENDOR_ASSESSMENTS === 'true';
const advancedAnalytics = import.meta.env.VITE_ENABLE_ADVANCED_ANALYTICS === 'true';

console.log('\n4. Feature Flags:');
console.log('   Vendor Assessments:', vendorAssessments ? '✅ Enabled' : '❌ Disabled');
console.log('   Advanced Analytics:', advancedAnalytics ? '✅ Enabled' : '❌ Disabled');

// Check for key components/pages
const hasSBOMAnalyzer = document.querySelector('[class*="SBOM"]') !== null ||
                        document.body.textContent.includes('SBOM') ||
                        window.location.pathname.includes('sbom');

const hasVendorDashboard = document.querySelector('[class*="Vendor"]') !== null ||
                           document.body.textContent.includes('Vendor Risk') ||
                           window.location.pathname.includes('vendor');

const hasDashboard = document.querySelector('[class*="Dashboard"]') !== null ||
                     document.body.textContent.includes('Dashboard') ||
                     window.location.pathname.includes('dashboard');

console.log('\n5. Key Features Detection:');
if (hasSBOMAnalyzer) {
  console.log('✅ SBOM Analyzer: Detected');
} else {
  console.log('⚠️  SBOM Analyzer: Not detected on current page');
}

if (hasVendorDashboard) {
  console.log('✅ Vendor Risk Dashboard: Detected');
} else {
  console.log('⚠️  Vendor Risk Dashboard: Not detected on current page');
}

if (hasDashboard) {
  console.log('✅ Dashboard: Detected');
} else {
  console.log('⚠️  Dashboard: Not detected on current page');
}

// Check hero title
const heroTitle = document.querySelector('h1')?.textContent || '';
console.log('\n6. Hero Section:');
if (heroTitle) {
  console.log('✅ Hero Title:', heroTitle.substring(0, 60) + (heroTitle.length > 60 ? '...' : ''));
  if (heroTitle.toLowerCase().includes('vendor') || heroTitle.toLowerCase().includes('supply chain')) {
    console.log('✅ Hero title matches product theme');
  } else {
    console.log('⚠️  Hero title may not match product theme');
  }
} else {
  console.log('❌ Hero Title: NOT FOUND');
}

// Check for navigation
const hasNavbar = document.querySelector('nav') !== null ||
                  document.querySelector('[class*="Navbar"]') !== null ||
                  document.querySelector('[class*="navbar"]') !== null;

const hasFooter = document.querySelector('footer') !== null ||
                  document.querySelector('[class*="Footer"]') !== null ||
                  document.querySelector('[class*="footer"]') !== null;

console.log('\n7. Layout Components:');
if (hasNavbar) {
  console.log('✅ Navigation: Found');
} else {
  console.log('❌ Navigation: NOT FOUND');
}

if (hasFooter) {
  console.log('✅ Footer: Found');
} else {
  console.log('❌ Footer: NOT FOUND');
}

// Check for disclaimers (compliance)
const hasDisclaimers = document.body.textContent.includes('estimated') ||
                       document.body.textContent.includes('approximately') ||
                       document.body.textContent.includes('based on available data') ||
                       document.body.textContent.includes('compliance');

console.log('\n8. Compliance:');
if (hasDisclaimers) {
  console.log('✅ Disclaimers found (estimated/approximately/compliance language present)');
} else {
  console.log('⚠️  Disclaimers may be missing (check for "estimated" or "approximately")');
}

// Check console errors
console.log('\n9. Console Errors:');
const errorCount = window.console._errors ? window.console._errors.length : 0;
if (errorCount === 0) {
  console.log('✅ No console errors detected');
} else {
  console.log('❌', errorCount, 'console error(s) detected');
}

// Check if config is exposed (development only)
if (typeof window !== 'undefined' && window.__APP_CONFIG__) {
  console.log('\n10. Development Config:');
  console.log('✅ App config exposed (development mode)');
  const config = window.__APP_CONFIG__;
  console.log('   Config:', {
    env: config.app?.env,
    version: config.app?.version,
    name: config.app?.name,
    isDemo: config.app?.isDemo,
    isTrial: config.app?.isTrial,
  });
}

// Summary
console.log('\n==========================================');
console.log('📊 Verification Summary:');
console.log('   Environment:', appEnv);
console.log('   Version:', appVersion);
console.log('   Supabase:', supabaseUrl ? '✅ Configured' : '❌ Missing');
console.log('   Stripe:', stripeKey ? '✅ Configured' : '⚠️  Not configured');
console.log('   Features:', {
  vendorAssessments: vendorAssessments ? '✅' : '❌',
  advancedAnalytics: advancedAnalytics ? '✅' : '❌',
});
console.log('   Layout:', {
  navbar: hasNavbar ? '✅' : '❌',
  footer: hasFooter ? '✅' : '❌',
});
console.log('   Errors:', errorCount === 0 ? '✅ None' : `❌ ${errorCount}`);
console.log('==========================================\n');

