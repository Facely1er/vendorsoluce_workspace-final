#!/usr/bin/env node

/**
 * Apply Trial & Onboarding Migration
 * Runs the specific migration for trial and onboarding tracking
 * 
 * Usage:
 *   node scripts/apply-trial-onboarding-migration.mjs
 * 
 * Environment Variables Required:
 *   SUPABASE_URL - Your Supabase project URL (defaults to project URL)
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key
 *   OR
 *   POSTGRES_CONNECTION_STRING - Direct Postgres connection string
 */

import pkg from 'pg';
const { Client } = pkg;
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dfklqsdfycwjlcasfciu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;

// Extract project reference from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'dfklqsdfycwjlcasfciu';

// Build connection string
let connectionString = POSTGRES_CONNECTION_STRING;

if (!connectionString) {
  if (POSTGRES_PASSWORD) {
    connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(POSTGRES_PASSWORD)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  } else {
    console.error('❌ Error: Either POSTGRES_CONNECTION_STRING or POSTGRES_PASSWORD is required');
    console.error('\n📝 Please set one of these:');
    console.error('   export POSTGRES_CONNECTION_STRING="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"');
    console.error('   # Or:');
    console.error('   export POSTGRES_PASSWORD="your_postgres_password"');
    console.error('   export SUPABASE_URL="https://[PROJECT].supabase.co"');
    console.error('\n💡 You can find your Postgres password in:');
    console.error('   Supabase Dashboard → Settings → Database → Database Password');
    process.exit(1);
  }
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

// Apply migration
async function applyMigration() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    console.log('📝 Applying migration: 20250117_add_onboarding_tracking.sql');
    console.log('   Adding onboarding tracking columns to vs_profiles...');
    
    await client.query(migrationSQL);
    
    console.log('✅ Migration applied successfully!');
    
    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const result = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
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

    if (result.rows.length === 4) {
      console.log('✅ Verification passed! All 4 columns exist:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('⚠️  Warning: Expected 4 columns, found', result.rows.length);
    }

    // Check index
    const indexResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'vs_profiles' 
      AND indexname = 'idx_vs_profiles_onboarding_status';
    `);

    if (indexResult.rows.length > 0) {
      console.log('✅ Index created: idx_vs_profiles_onboarding_status');
    } else {
      console.log('⚠️  Warning: Index not found');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Deploy edge functions (see scripts/deploy-trial-functions.ps1)');
    console.log('   2. Configure environment variables in Supabase Dashboard');
    console.log('   3. Set up cron job (see scripts/setup-cron-job.sql)');

  } catch (error) {
    console.error('❌ Error applying migration:');
    console.error(`   ${error.message}`);
    
    if (error.message.includes('already exists')) {
      console.log('\n💡 Note: Some columns may already exist. This is safe to ignore.');
      console.log('   The migration uses "IF NOT EXISTS" so it won\'t fail.');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migration
applyMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

