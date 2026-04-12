// Test Supabase connection and check if tables exist
import { createClient } from '@supabase/supabase-js';

// SECURITY: Never hardcode credentials. Always use environment variables.
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required. Set them in your .env.local file or environment.');
}
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('vs_profiles').select('count').limit(1);
    
    if (error) {
      console.error('Connection error:', error);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test if vendor assessment tables exist
    const tables = [
      'vs_vendor_assessments',
      'vs_assessment_frameworks', 
      'vs_assessment_questions',
      'vs_assessment_responses',
      'vs_vendors'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ Table ${table} does not exist or is not accessible:`, error.message);
        } else {
          console.log(`✅ Table ${table} exists and is accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${table} error:`, err.message);
      }
    }
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testConnection();