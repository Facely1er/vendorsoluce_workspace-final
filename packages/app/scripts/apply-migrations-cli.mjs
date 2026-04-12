#!/usr/bin/env node

/**
 * Migration Script for VendorSoluce
 * Applies all database migrations using Supabase CLI
 * 
 * Usage:
 *   node scripts/apply-migrations-cli.mjs
 * 
 * Environment Variables Required:
 *   SUPABASE_URL - Your Supabase project URL (default: https://nuwfdvwqiynzhbbsqagw.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key
 *   SUPABASE_ACCESS_TOKEN - Your Supabase access token (optional, for linking)
 */

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nuwfdvwqiynzhbbsqagw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

// Extract project reference from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Error: Could not extract project reference from Supabase URL');
  console.error(`   URL: ${SUPABASE_URL}`);
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('   Please set it before running this script:');
  console.error('   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

// Get migrations directory
const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

// Get all migration files and sort them
function getMigrationFiles() {
  const files = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort alphabetically (which should be chronologically)
  
  return files;
}

// Main function
async function main() {
  console.log('🚀 Starting database migrations using Supabase CLI...\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Project Reference: ${projectRef}`);
  console.log(`🔑 Using service role key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
  
  const migrationFiles = getMigrationFiles();
  console.log(`\n📋 Found ${migrationFiles.length} migration files:`);
  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  
  console.log('\n📝 Step 1: Linking to Supabase project...');
  
  try {
    // Link to the project
    if (SUPABASE_ACCESS_TOKEN) {
      console.log('   Using Supabase access token for linking...');
      execSync(`npx supabase link --project-ref ${projectRef} --password ${SUPABASE_SERVICE_ROLE_KEY}`, {
        stdio: 'inherit',
        env: {
          ...process.env,
          SUPABASE_ACCESS_TOKEN: SUPABASE_ACCESS_TOKEN
        }
      });
    } else {
      console.log('   Attempting to link without access token...');
      console.log('   ⚠️  If this fails, you may need to set SUPABASE_ACCESS_TOKEN');
      console.log('   Or link manually: npx supabase link --project-ref ' + projectRef);
      
      // Try to link using the service role key as password
      try {
        execSync(`npx supabase link --project-ref ${projectRef}`, {
          stdio: 'inherit'
        });
      } catch (error) {
        console.log('\n⚠️  Automatic linking failed. Please link manually:');
        console.log(`   npx supabase link --project-ref ${projectRef}`);
        console.log('\n   Then run this script again, or use:');
        console.log('   npx supabase db push\n');
        process.exit(1);
      }
    }
    
    console.log('   ✅ Project linked successfully\n');
  } catch (error) {
    console.error('   ❌ Error linking project:', error.message);
    console.log('\n   Please link manually:');
    console.log(`   npx supabase link --project-ref ${projectRef}`);
    console.log('\n   Then run:');
    console.log('   npx supabase db push\n');
    process.exit(1);
  }
  
  console.log('📝 Step 2: Pushing migrations to production...');
  
  try {
    // Push all migrations
    execSync('npx supabase db push', {
      stdio: 'inherit'
    });
    
    console.log('\n✅ All migrations applied successfully!\n');
  } catch (error) {
    console.error('\n❌ Error pushing migrations:', error.message);
    console.log('\n   You can also apply migrations manually:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Navigate to SQL Editor');
    console.log('   4. Run each migration file in order\n');
    process.exit(1);
  }
  
  console.log('🎉 Migration process completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Verify migrations in Supabase Dashboard → Database → Migrations');
  console.log('   2. Check Database Linter for any warnings');
  console.log('   3. Test critical user flows');
  console.log('   4. Monitor error logs\n');
}

// Run main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

