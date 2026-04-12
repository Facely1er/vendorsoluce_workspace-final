/**
 * Smoke Test Executor for VendorSoluce Production
 * 
 * This script performs automated smoke tests on the production deployment
 * to verify basic functionality and accessibility.
 */

import fetch from 'node-fetch';
import { writeFileSync } from 'fs';

const PRODUCTION_URL = 'https://vendorsoluce-pdg22kipi-facelys-projects.vercel.app';
const TEST_RESULTS = {
  timestamp: new Date().toISOString(),
  url: PRODUCTION_URL,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    blocked: 0
  }
};

/**
 * Test a URL endpoint
 */
async function testEndpoint(name, url, expectedStatus = 200) {
  const test = {
    name,
    url,
    expectedStatus,
    status: 'pending',
    duration: 0,
    error: null,
    response: null
  };

  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'VendorSoluce-SmokeTest/1.0'
      },
      timeout: 10000 // 10 second timeout
    });

    test.duration = Date.now() - startTime;
    test.response = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    };

    if (response.status === expectedStatus) {
      test.status = 'passed';
      TEST_RESULTS.summary.passed++;
    } else {
      test.status = 'failed';
      test.error = `Expected status ${expectedStatus}, got ${response.status}`;
      TEST_RESULTS.summary.failed++;
    }
  } catch (error) {
    test.duration = Date.now() - startTime;
    test.status = 'failed';
    test.error = error.message;
    TEST_RESULTS.summary.failed++;
  }

  TEST_RESULTS.summary.total++;
  TEST_RESULTS.tests.push(test);
  
  return test;
}

/**
 * Run all smoke tests
 */
async function runSmokeTests() {
  console.log('🔥 Starting Smoke Tests for VendorSoluce Production\n');
  console.log(`Production URL: ${PRODUCTION_URL}\n`);
  console.log('='.repeat(60));

  // Test 1: Homepage accessibility
  console.log('\n[1/10] Testing Homepage Accessibility...');
  await testEndpoint('Homepage', PRODUCTION_URL, 200);

  // Test 2: Sign In page
  console.log('[2/10] Testing Sign In Page...');
  await testEndpoint('Sign In Page', `${PRODUCTION_URL}/signin`, 200);

  // Test 3: Pricing page
  console.log('[3/10] Testing Pricing Page...');
  await testEndpoint('Pricing Page', `${PRODUCTION_URL}/pricing`, 200);

  // Test 4: About page
  console.log('[4/10] Testing About Page...');
  await testEndpoint('About Page', `${PRODUCTION_URL}/about`, 200);

  // Test 5: Contact page
  console.log('[5/10] Testing Contact Page...');
  await testEndpoint('Contact Page', `${PRODUCTION_URL}/contact`, 200);

  // Test 6: Dashboard (should redirect if not authenticated)
  console.log('[6/10] Testing Dashboard (Protected Route)...');
  await testEndpoint('Dashboard', `${PRODUCTION_URL}/dashboard`, [200, 302, 401, 403]);

  // Test 7: SBOM Analyzer
  console.log('[7/10] Testing SBOM Analyzer...');
  await testEndpoint('SBOM Analyzer', `${PRODUCTION_URL}/sbom-analyzer`, [200, 302]);

  // Test 8: Supply Chain Assessment
  console.log('[8/10] Testing Supply Chain Assessment...');
  await testEndpoint('Supply Chain Assessment', `${PRODUCTION_URL}/supply-chain-assessment`, [200, 302]);

  // Test 9: Vendor Risk Dashboard
  console.log('[9/10] Testing Vendor Risk Dashboard...');
  await testEndpoint('Vendor Risk Dashboard', `${PRODUCTION_URL}/vendors`, [200, 302]);

  // Test 10: API Documentation
  console.log('[10/10] Testing API Documentation...');
  await testEndpoint('API Documentation', `${PRODUCTION_URL}/api-docs`, [200, 302]);

  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary:');
  console.log(`Total Tests: ${TEST_RESULTS.summary.total}`);
  console.log(`✅ Passed: ${TEST_RESULTS.summary.passed}`);
  console.log(`❌ Failed: ${TEST_RESULTS.summary.failed}`);
  console.log(`⚠️  Blocked: ${TEST_RESULTS.summary.blocked}`);

  // Save results to file
  const resultsFile = 'smoke-test-results.json';
  writeFileSync(resultsFile, JSON.stringify(TEST_RESULTS, null, 2));
  console.log(`\n📄 Results saved to: ${resultsFile}`);

  // Print detailed results
  console.log('\n📋 Detailed Test Results:');
  TEST_RESULTS.tests.forEach((test, index) => {
    const statusIcon = test.status === 'passed' ? '✅' : '❌';
    console.log(`${statusIcon} [${index + 1}] ${test.name}`);
    console.log(`   URL: ${test.url}`);
    console.log(`   Status: ${test.response?.status || 'N/A'} (${test.status})`);
    console.log(`   Duration: ${test.duration}ms`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
    console.log('');
  });

  // Overall status
  const overallStatus = TEST_RESULTS.summary.failed === 0 ? '✅ PASS' : '❌ FAIL';
  console.log(`\n🎯 Overall Status: ${overallStatus}`);

  return TEST_RESULTS;
}

// Run tests
runSmokeTests()
  .then(() => {
    console.log('\n✅ Smoke tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Smoke tests failed with error:', error);
    process.exit(1);
  });

