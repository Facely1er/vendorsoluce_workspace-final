#!/usr/bin/env node

/**
 * Migration Runner for VendorSoluce
 * Provides multiple options to apply database migrations
 * 
 * Usage:
 *   node scripts/run-migrations.mjs
 * 
 * Environment Variables:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key
 *   POSTGRES_CONNECTION_STRING - Direct Postgres connection string (optional)
 *   POSTGRES_PASSWORD - Postgres database password (optional)
 */

import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nuwfdvwqiynzhbbsqagw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;

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

console.log('🚀 VendorSoluce Database Migration Runner\n');
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Project Reference: ${projectRef}\n`);

const migrationFiles = getMigrationFiles();
console.log(`📋 Found ${migrationFiles.length} migration files:\n`);
migrationFiles.forEach((file, index) => {
  console.log(`   ${index + 1}. ${file}`);
});

console.log('\n📝 Choose a method to apply migrations:\n');

// Method 1: Supabase CLI (Recommended)
console.log('1️⃣  Supabase CLI (Recommended)');
console.log('   Run these commands:');
console.log(`   npx supabase link --project-ref ${projectRef}`);
console.log('   npx supabase db push\n');

// Method 2: Direct Postgres Connection
if (POSTGRES_CONNECTION_STRING || POSTGRES_PASSWORD) {
  console.log('2️⃣  Direct Postgres Connection');
  if (POSTGRES_CONNECTION_STRING) {
    console.log('   ✅ POSTGRES_CONNECTION_STRING found');
    console.log('   Run: node scripts/apply-migrations-direct.mjs\n');
  } else if (POSTGRES_PASSWORD) {
    console.log('   ✅ POSTGRES_PASSWORD found');
    console.log('   Run: node scripts/apply-migrations-direct.mjs\n');
  }
} else {
  console.log('2️⃣  Direct Postgres Connection');
  console.log('   ⚠️  Requires POSTGRES_CONNECTION_STRING or POSTGRES_PASSWORD');
  console.log('   Set environment variable and run: node scripts/apply-migrations-direct.mjs\n');
}

// Method 3: Supabase Dashboard SQL Editor
console.log('3️⃣  Supabase Dashboard SQL Editor (Manual)');
console.log('   Steps:');
console.log('   1. Go to https://supabase.com/dashboard');
console.log(`   2. Select project: ${projectRef}`);
console.log('   3. Navigate to SQL Editor');
console.log('   4. Run each migration file in order\n');

// Method 4: Service Role Key (if available)
if (SUPABASE_SERVICE_ROLE_KEY) {
  console.log('4️⃣  Service Role Key Available');
  console.log('   ✅ Service role key found');
  console.log('   Note: Service role key is for REST API, not direct Postgres connection');
  console.log('   To use it, you need to:');
  console.log('   - Use Supabase CLI (method 1)');
  console.log('   - Or get Postgres password from Supabase Dashboard');
  console.log('   - Or use Supabase Dashboard SQL Editor (method 3)\n');
} else {
  console.log('4️⃣  Service Role Key');
  console.log('   ⚠️  SUPABASE_SERVICE_ROLE_KEY not found');
  console.log('   Set it if you want to use Supabase CLI\n');
}

console.log('💡 Recommended Approach:');
console.log('   Use Supabase CLI (method 1) - it handles authentication automatically\n');

console.log('📋 Migration Files Location:');
console.log(`   ${migrationsDir}\n`);

console.log('🔗 Quick Links:');
console.log(`   Supabase Dashboard: https://supabase.com/dashboard/project/${projectRef}`);
console.log(`   SQL Editor: https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);

