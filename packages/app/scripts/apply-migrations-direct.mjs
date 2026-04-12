#!/usr/bin/env node

/**
 * Migration Script for VendorSoluce
 * Applies all database migrations using direct Postgres connection
 * 
 * Usage:
 *   node scripts/apply-migrations-direct.mjs
 * 
 * Environment Variables Required:
 *   POSTGRES_CONNECTION_STRING - Postgres connection string
 *     Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
 *   
 *   OR
 *   
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key
 *   POSTGRES_PASSWORD - Your Postgres database password (if not in connection string)
 */

import pkg from 'pg';
const { Client } = pkg;
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dfklqsdfycwjlcasfciu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;

// Get migrations directory
const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

// Get all migration files and sort them chronologically
function getMigrationFiles() {
  const files = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => {
      // Extract timestamp from filename (format: YYYYMMDDHHMMSS_description.sql)
      // Sort by the numeric prefix
      const timestampA = a.match(/^(\d+)/)?.[1] || '';
      const timestampB = b.match(/^(\d+)/)?.[1] || '';
      return timestampA.localeCompare(timestampB);
    });
  
  return files;
}

// Read migration file content
function readMigrationFile(filename) {
  const filePath = join(migrationsDir, filename);
  return readFileSync(filePath, 'utf-8');
}

// Construct Postgres connection string
function getConnectionString() {
  if (POSTGRES_CONNECTION_STRING) {
    return POSTGRES_CONNECTION_STRING;
  }
  
  // Extract project reference from URL
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectRef) {
    throw new Error('Could not extract project reference from Supabase URL');
  }
  
  if (!POSTGRES_PASSWORD) {
    throw new Error('POSTGRES_PASSWORD or POSTGRES_CONNECTION_STRING is required');
  }
  
  // Construct connection string
  // Try direct connection first (more reliable for migrations)
  const directUrl = `postgresql://postgres:${POSTGRES_PASSWORD}@db.${projectRef}.supabase.co:5432/postgres`;
  // Pooler connection (alternative)
  const poolerUrl = `postgresql://postgres.${projectRef}:${POSTGRES_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  
  // Return direct URL (more reliable for migrations)
  return directUrl;
}

// Apply a single migration
async function applyMigration(client, filename) {
  console.log(`\n📄 Applying migration: ${filename}`);
  
  try {
    const sql = readMigrationFile(filename);
    
    // Execute the entire migration file
    await client.query(sql);
    
    console.log(`   ✅ Migration ${filename} applied successfully`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error applying migration ${filename}:`, error.message);
    
    // Check if it's a "already exists" error (which is okay)
    if (error.message.includes('already exists') || 
        error.message.includes('duplicate key') ||
        error.message.includes('relation already exists')) {
      console.log(`   ⚠️  Migration may have already been applied (non-critical error)`);
      return true; // Continue with other migrations
    }
    
    throw error;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting database migrations using direct Postgres connection...\n');
  
  let connectionString;
  try {
    connectionString = getConnectionString();
    console.log(`📍 Connection: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Please provide one of these:');
    console.log('   1. POSTGRES_CONNECTION_STRING environment variable');
    console.log('      Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres');
    console.log('\n   2. POSTGRES_PASSWORD environment variable');
    console.log('      (Will construct connection string from SUPABASE_URL)');
    console.log('\n   3. Or use Supabase CLI:');
    console.log('      npx supabase link --project-ref dfklqsdfycwjlcasfciu');
    console.log('      npx supabase db push\n');
    process.exit(1);
  }
  
  const migrationFiles = getMigrationFiles();
  console.log(`\n📋 Found ${migrationFiles.length} migration files:`);
  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  
  // Create Postgres client
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('\n🔌 Connecting to database...');
    await client.connect();
    console.log('   ✅ Connected successfully\n');
    
    // Apply each migration in order
    let successCount = 0;
    let failCount = 0;
    
    for (const file of migrationFiles) {
      try {
        const success = await applyMigration(client, file);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`   ❌ Failed to apply ${file}:`, error.message);
        failCount++;
        
        // Ask if we should continue
        console.log('\n⚠️  Migration failed. Do you want to continue with remaining migrations?');
        console.log('   (You can also apply migrations manually via Supabase Dashboard SQL Editor)');
        
        // For now, continue with other migrations
        // In production, you might want to stop here
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📄 Total: ${migrationFiles.length}`);
    
    if (failCount === 0) {
      console.log('\n🎉 All migrations applied successfully!');
    } else {
      console.log('\n⚠️  Some migrations failed. Please review the errors above.');
      console.log('   You can apply failed migrations manually via Supabase Dashboard SQL Editor.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed.');
  }
  
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

