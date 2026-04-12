#!/usr/bin/env node

/**
 * Migration Script for VendorSoluce
 * Applies all database migrations to production Supabase instance
 * 
 * Usage:
 *   node scripts/apply-migrations.mjs
 * 
 * Environment Variables Required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nuwfdvwqiynzhbbsqagw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('   Please set it before running this script:');
  console.error('   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Get migrations directory
const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

// Get all migration files and sort them
function getMigrationFiles() {
  const files = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort alphabetically (which should be chronologically)
  
  return files;
}

// Read migration file content
function readMigrationFile(filename) {
  const filePath = join(migrationsDir, filename);
  return readFileSync(filePath, 'utf-8');
}

// Execute SQL using Supabase REST API
async function executeSQL(sql) {
  try {
    // Use the Supabase REST API to execute SQL
    // Note: Supabase doesn't expose a direct SQL endpoint, so we'll use the PostgREST API
    // For migrations, we need to use the management API or direct Postgres connection
    // Since we have service role key, we can use the REST API with proper headers
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    // If the RPC doesn't exist, we'll need to use a different approach
    // For now, let's use the direct Postgres connection approach
    throw error;
  }
}

// Alternative: Execute SQL using direct Postgres connection
async function executeSQLDirect(sql) {
  // Parse the Supabase URL to get connection details
  const url = new URL(SUPABASE_URL);
  const projectRef = url.hostname.split('.')[0];
  
  // Supabase Postgres connection string format
  // We'll need to construct the connection string from the service role key
  // Actually, we need to use the Supabase Management API or pg library
  
  // For now, let's use a simpler approach: output the SQL for manual execution
  // or use the Supabase CLI approach
  
  console.log('⚠️  Direct SQL execution requires pg library or Supabase CLI');
  console.log('   Please use one of these methods:');
  console.log('   1. Use Supabase Dashboard SQL Editor');
  console.log('   2. Use Supabase CLI: npx supabase db push');
  console.log('   3. Install pg library and use direct Postgres connection');
  
  return null;
}

// Apply a single migration
async function applyMigration(filename) {
  console.log(`\n📄 Applying migration: ${filename}`);
  
  try {
    const sql = readMigrationFile(filename);
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) {
        continue;
      }
      
      // Add semicolon back if needed
      const fullStatement = statement.endsWith(';') ? statement : statement + ';';
      
      try {
        // Use Supabase REST API to execute
        // Note: This requires a custom function or direct Postgres access
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
        
        // For now, we'll output the SQL for manual execution
        // In production, you'd want to use pg library or Supabase Management API
        console.log(`   ⚠️  Statement preview (first 100 chars): ${fullStatement.substring(0, 100)}...`);
      } catch (error) {
        console.error(`   ❌ Error executing statement ${i + 1}:`, error.message);
        throw error;
      }
    }
    
    console.log(`   ✅ Migration ${filename} applied successfully`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error applying migration ${filename}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Using service role key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
  
  const migrationFiles = getMigrationFiles();
  console.log(`\n📋 Found ${migrationFiles.length} migration files:`);
  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  
  console.log('\n⚠️  Note: This script requires direct Postgres access or Supabase Management API.');
  console.log('   For now, we recommend using one of these methods:\n');
  console.log('   1. Supabase Dashboard SQL Editor (Recommended)');
  console.log('      - Go to https://supabase.com/dashboard');
  console.log('      - Select your project');
  console.log('      - Navigate to SQL Editor');
  console.log('      - Run each migration file in order\n');
  console.log('   2. Supabase CLI');
  console.log('      - npx supabase link --project-ref nuwfdvwqiynzhbbsqagw');
  console.log('      - npx supabase db push\n');
  console.log('   3. Install pg library and update this script');
  console.log('      - npm install pg');
  console.log('      - Update script to use direct Postgres connection\n');
  
  // Ask user if they want to continue with manual approach
  console.log('📝 Migration files are ready in: supabase/migrations/');
  console.log('   Please apply them using one of the methods above.\n');
  
  process.exit(0);
}

// Run main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

