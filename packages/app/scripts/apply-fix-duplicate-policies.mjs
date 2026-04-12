#!/usr/bin/env node

/**
 * Apply Fix Duplicate Permissive Policies Migration
 * Runs the migration to fix duplicate RLS policies
 * 
 * Usage:
 *   node scripts/apply-fix-duplicate-policies.mjs
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
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;

// Extract project reference from URL if provided
let projectRef = null;
if (SUPABASE_URL) {
  projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
}

// Build connection string
let connectionString = POSTGRES_CONNECTION_STRING;

if (!connectionString) {
  if (POSTGRES_PASSWORD && projectRef) {
    connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(POSTGRES_PASSWORD)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  } else {
    console.error('❌ Error: Either POSTGRES_CONNECTION_STRING or (POSTGRES_PASSWORD + SUPABASE_URL) is required');
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
const migrationFile = join(__dirname, '..', 'supabase', 'migrations', '20250120000001_fix_duplicate_permissive_policies.sql');
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

    console.log('📝 Applying migration: 20250120000001_fix_duplicate_permissive_policies.sql');
    console.log('   Fixing duplicate permissive RLS policies...');
    
    await client.query(migrationSQL);
    
    console.log('✅ Migration applied successfully!');
    
    // Verify the migration by checking policies
    console.log('\n🔍 Verifying migration...');
    
    // Check assets table policies
    const assetsResult = await client.query(`
      SELECT policyname, cmd, roles 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'assets'
      AND cmd = 'INSERT'
      AND 'authenticated' = ANY(roles);
    `);
    
    if (assetsResult.rows.length === 1) {
      console.log('✅ assets table: Single INSERT policy found');
      console.log(`   Policy: ${assetsResult.rows[0].policyname}`);
    } else {
      console.log(`⚠️  assets table: Found ${assetsResult.rows.length} INSERT policies (expected 1)`);
      assetsResult.rows.forEach(row => {
        console.log(`   - ${row.policyname}`);
      });
    }
    
    // Check profiles table policies
    const profilesResult = await client.query(`
      SELECT policyname, cmd, roles 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles'
      AND cmd = 'SELECT'
      AND 'authenticated' = ANY(roles);
    `);
    
    if (profilesResult.rows.length === 1) {
      console.log('✅ profiles table: Single SELECT policy found');
      console.log(`   Policy: ${profilesResult.rows[0].policyname}`);
    } else {
      console.log(`⚠️  profiles table: Found ${profilesResult.rows.length} SELECT policies (expected 1)`);
      profilesResult.rows.forEach(row => {
        console.log(`   - ${row.policyname}`);
      });
    }
    
    // Check vs_profiles table policies
    const vsProfilesResult = await client.query(`
      SELECT policyname, cmd, roles 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'vs_profiles'
      AND cmd = 'SELECT'
      AND 'authenticated' = ANY(roles);
    `);
    
    if (vsProfilesResult.rows.length === 1) {
      console.log('✅ vs_profiles table: Single SELECT policy found');
      console.log(`   Policy: ${vsProfilesResult.rows[0].policyname}`);
    } else {
      console.log(`⚠️  vs_profiles table: Found ${vsProfilesResult.rows.length} SELECT policies (expected 1)`);
      vsProfilesResult.rows.forEach(row => {
        console.log(`   - ${row.policyname}`);
      });
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Check Supabase Database Linter to verify warnings are resolved');
    console.log('   2. Test user authentication and data access');
    console.log('   3. Monitor query performance');

  } catch (error) {
    console.error('❌ Error applying migration:');
    console.error(`   ${error.message}`);
    
    if (error.message.includes('already exists') || error.message.includes('does not exist')) {
      console.log('\n💡 Note: Some policies may have already been removed or don\'t exist.');
      console.log('   This is safe to ignore if the migration completed.');
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

