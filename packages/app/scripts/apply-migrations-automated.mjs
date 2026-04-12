#!/usr/bin/env node

/**
 * Automated Migration Script
 * Attempts to apply migrations using available credentials
 */

import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nuwfdvwqiynzhbbsqagw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const projectRef = 'nuwfdvwqiynzhbbsqagw';

console.log('🚀 Automated Migration Application\n');
console.log(`📍 Project: ${projectRef}`);
console.log(`🔗 URL: ${SUPABASE_URL}\n`);

// Check available credentials
console.log('🔍 Checking available credentials...\n');

if (SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ Service Role Key: Found');
} else {
  console.log('❌ Service Role Key: Not found');
}

if (POSTGRES_PASSWORD) {
  console.log('✅ Postgres Password: Found');
} else {
  console.log('❌ Postgres Password: Not found');
}

console.log('\n📝 To use Supabase CLI, you need the Postgres password.');
console.log('   Get it from: Supabase Dashboard → Settings → Database → Connection string\n');

// Try to link if we have Postgres password
if (POSTGRES_PASSWORD) {
  console.log('🔗 Attempting to link project with Postgres password...\n');
  try {
    execSync(`npx supabase link --project-ref ${projectRef} --password "${POSTGRES_PASSWORD}" --yes`, {
      stdio: 'inherit'
    });
    console.log('\n✅ Project linked successfully!\n');
    
    console.log('📤 Pushing migrations to production...\n');
    execSync('npx supabase db push', {
      stdio: 'inherit'
    });
    
    console.log('\n🎉 All migrations applied successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📝 Please try manual method:\n');
    console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
    console.log('   2. Copy each migration file from supabase/migrations/');
    console.log('   3. Paste and run in SQL Editor\n');
    process.exit(1);
  }
} else {
  console.log('\n⚠️  Postgres password not found. Cannot use Supabase CLI automatically.\n');
  console.log('📝 To proceed, choose one of these options:\n');
  console.log('Option 1: Get Postgres Password and Set Environment Variable');
  console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/settings/database');
  console.log('   2. Copy the Postgres password from connection string');
  console.log('   3. Set environment variable:');
  console.log('      $env:POSTGRES_PASSWORD="your_postgres_password"');
  console.log('   4. Run this script again\n');
  console.log('Option 2: Use Supabase Dashboard SQL Editor (Recommended)');
  console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('   2. Copy each migration file from supabase/migrations/');
  console.log('   3. Paste and run in SQL Editor\n');
  console.log('Option 3: Use Supabase CLI Manually');
  console.log('   npx supabase link --project-ref ' + projectRef + ' --password YOUR_POSTGRES_PASSWORD');
  console.log('   npx supabase db push\n');
  process.exit(0);
}

