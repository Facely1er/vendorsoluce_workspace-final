#!/usr/bin/env node

/**
 * Apply Trial & Onboarding Migration via Supabase REST API
 * Uses Supabase Management API to execute SQL
 * 
 * Usage:
 *   node scripts/apply-trial-migration-via-api.mjs
 * 
 * Environment Variables:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dfklqsdfycwjlcasfciu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('\n📝 Please set it:');
  console.error('   $env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"');
  console.error('\n💡 You can find it in:');
  console.error('   Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

// Read migration file
const migrationFile = join(__dirname, '..', 'supabase', 'migrations', '20250117_add_onboarding_tracking.sql');
let migrationSQL;

try {
  migrationSQL = readFileSync(migrationFile, 'utf8');
} catch (error) {
  console.error(`❌ Error reading migration file: ${migrationFile}`);
  console.error(`   ${error.message}`);
  process.exit(1);
}

// Apply migration via Supabase REST API
async function applyMigration() {
  try {
    console.log('🚀 Applying migration via Supabase REST API...');
    console.log(`📍 Project: ${SUPABASE_URL}`);
    console.log('📝 Migration: 20250117_add_onboarding_tracking.sql\n');

    // Use Supabase REST API to execute SQL
    // Note: Supabase doesn't have a direct SQL execution endpoint via REST API
    // We'll use the PostgREST API with rpc, but for DDL we need direct Postgres
    // So we'll provide instructions instead
    
    console.log('⚠️  Note: Supabase REST API cannot execute DDL statements directly.');
    console.log('   Please use one of these methods:\n');
    
    console.log('📋 Method 1: Supabase Dashboard (Recommended)');
    console.log('   1. Go to: https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Navigate to: SQL Editor → New Query');
    console.log('   4. Copy contents of: RUN_TRIAL_ONBOARDING_MIGRATION.sql');
    console.log('   5. Paste and click Run\n');
    
    console.log('📋 Method 2: Direct Postgres Connection');
    console.log('   Set POSTGRES_PASSWORD and run:');
    console.log('   node scripts/apply-trial-onboarding-migration.mjs\n');
    
    // However, we can verify if columns already exist using the REST API
    console.log('🔍 Checking if migration is already applied...\n');
    
    const checkUrl = `${SUPABASE_URL}/rest/v1/rpc/check_onboarding_columns`;
    
    // Since we can't easily check via REST API without a custom function,
    // let's just provide the SQL to check
    console.log('💡 To verify migration, run this SQL in Supabase Dashboard:');
    console.log(`
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'vs_profiles' 
AND column_name IN (
  'onboarding_started', 
  'onboarding_started_at', 
  'onboarding_completed', 
  'onboarding_completed_at'
)
ORDER BY column_name;
    `);
    
    console.log('\n✅ If you see 4 rows, the migration is already applied!');
    console.log('   If not, use Method 1 above to apply it.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run
applyMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

