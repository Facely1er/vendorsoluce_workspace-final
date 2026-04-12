#!/usr/bin/env node

/**
 * Apply Migrations Using Service Role Key
 * Uses Supabase REST API to execute SQL via RPC functions
 * 
 * Note: This requires creating a custom RPC function first, or using direct Postgres connection
 * 
 * For now, this script will use the Supabase Management API or direct Postgres connection
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nuwfdvwqiynzhbbsqagw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('\n📝 Please set it:');
  console.error('   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('   # Or in PowerShell:');
  console.error('   $env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"');
  process.exit(1);
}

// Extract project reference
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'nuwfdvwqiynzhbbsqagw';

// Get migrations directory
const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

// Get all migration files
function getMigrationFiles() {
  const files = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  return files;
}

// Read migration file
function readMigrationFile(filename) {
  const filePath = join(migrationsDir, filename);
  return readFileSync(filePath, 'utf-8');
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Execute SQL using Supabase REST API
// Note: Supabase doesn't expose direct SQL execution via REST API
// We need to use the Management API or direct Postgres connection
async function executeSQL(sql) {
  // Try to use the Supabase Management API
  // This requires the project reference and service role key
  
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY
    },
    body: JSON.stringify({
      query: sql
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
}

// Main function
async function main() {
  console.log('🚀 Applying Migrations Using Service Role Key\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Project Reference: ${projectRef}`);
  console.log(`🔑 Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...\n`);

  const migrationFiles = getMigrationFiles();
  console.log(`📋 Found ${migrationFiles.length} migration files:\n`);
  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });

  console.log('\n⚠️  Note: Supabase REST API doesn\'t support direct SQL execution.');
  console.log('   The service role key is for REST API access, not direct SQL execution.');
  console.log('\n📝 Recommended approaches:\n');
  console.log('1️⃣  Use Supabase Dashboard SQL Editor (Easiest)');
  console.log('   - Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('   - Copy and paste each migration file');
  console.log('   - Click Run\n');
  console.log('2️⃣  Use Supabase CLI with Postgres Password');
  console.log('   - Get Postgres password from: Supabase Dashboard → Settings → Database');
  console.log('   - Run: npx supabase link --project-ref ' + projectRef + ' --password YOUR_POSTGRES_PASSWORD');
  console.log('   - Run: npx supabase db push\n');
  console.log('3️⃣  Use Direct Postgres Connection');
  console.log('   - Get Postgres connection string from Supabase Dashboard');
  console.log('   - Set POSTGRES_CONNECTION_STRING environment variable');
  console.log('   - Run: node scripts/apply-migrations-direct.mjs\n');

  console.log('💡 The service role key is different from the Postgres password.');
  console.log('   Service role key = REST API access');
  console.log('   Postgres password = Direct database access\n');

  console.log('📋 Migration files are ready in: supabase/migrations/');
  console.log('   Please use one of the methods above to apply them.\n');
}

// Run main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

