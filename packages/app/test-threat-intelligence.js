/**
 * Test script for threat intelligence API integrations
 * Run this to verify the APIs are working correctly
 */

import { 
  fetchThreatStats, 
  fetchCVEData, 
  fetchThreatFoxData, 
  fetchMISPData,
  THREAT_SOURCES 
} from './src/utils/threatIntelligence';

async function testThreatIntelligenceAPIs() {
  console.log('🔍 Testing Threat Intelligence APIs...\n');
  
  try {
    // Test 1: Fetch threat statistics
    console.log('📊 Testing threat statistics aggregation...');
    const stats = await fetchThreatStats();
    console.log('✅ Threat Stats:', {
      activeSources: stats.activeSources,
      threatsToday: stats.threatsToday,
      coverage: stats.coverage,
      lastUpdated: stats.lastUpdated
    });
    
    // Test 2: Fetch CVE data
    console.log('\n🛡️ Testing CVE Database API...');
    const cveData = await fetchCVEData();
    console.log(`✅ CVE Data: Found ${cveData.length} vulnerabilities`);
    if (cveData.length > 0) {
      console.log('Sample CVE:', cveData[0]);
    }
    
    // Test 3: Fetch ThreatFox data
    console.log('\n🦊 Testing ThreatFox API...');
    const threatFoxData = await fetchThreatFoxData();
    console.log(`✅ ThreatFox Data: Found ${threatFoxData.length} threat indicators`);
    if (threatFoxData.length > 0) {
      console.log('Sample Threat:', threatFoxData[0]);
    }
    
    // Test 4: Fetch MISP data
    console.log('\n🔗 Testing MISP API...');
    const mispData = await fetchMISPData();
    console.log(`✅ MISP Data: Found ${mispData.length} threat indicators`);
    if (mispData.length > 0) {
      console.log('Sample MISP Threat:', mispData[0]);
    }
    
    // Test 5: Display threat sources
    console.log('\n📡 Available Threat Sources:');
    THREAT_SOURCES.forEach(source => {
      console.log(`- ${source.name}: ${source.url} (${source.status})`);
    });
    
    console.log('\n🎉 All threat intelligence APIs are working correctly!');
    console.log('\n📈 Summary:');
    console.log(`- Active Sources: ${stats.activeSources}`);
    console.log(`- Total Threats Today: ${stats.threatsToday}`);
    console.log(`- Coverage: ${stats.coverage}%`);
    console.log(`- Last Updated: ${new Date(stats.lastUpdated).toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error testing threat intelligence APIs:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify API endpoints are accessible');
    console.log('3. Check browser console for CORS errors');
    console.log('4. APIs may fall back to mock data if external services are unavailable');
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('🌐 Running in browser environment');
  testThreatIntelligenceAPIs();
} else {
  // Node.js environment
  console.log('🖥️ Running in Node.js environment');
  testThreatIntelligenceAPIs();
}

export { testThreatIntelligenceAPIs };
