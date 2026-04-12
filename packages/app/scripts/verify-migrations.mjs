import pg from 'pg';
const { Client } = pg;
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dfklqsdfycwjlcasfciu.supabase.co';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;

if (!POSTGRES_PASSWORD) {
  console.error('❌ POSTGRES_PASSWORD environment variable is required');
  process.exit(1);
}

// Extract project reference from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  throw new Error('Could not extract project reference from Supabase URL');
}

// Construct connection string
const connectionString = `postgresql://postgres:${POSTGRES_PASSWORD}@db.${projectRef}.supabase.co:5432/postgres`;

console.log('🔍 Starting Migration Verification...\n');
console.log(`📍 Connection: postgresql://postgres:****@db.${projectRef}.supabase.co:5432/postgres\n`);

const client = new Client({ connectionString });

try {
  await client.connect();
  console.log('✅ Connected to database\n');

  // Verification queries
  const verifications = [
    {
      name: 'Core Tables (vs_ prefix)',
      query: `
        SELECT COUNT(*) as count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'vs_%'
      `,
      minCount: 15,
      description: 'Core VendorSoluce tables with vs_ prefix'
    },
    {
      name: 'Stripe Integration Tables',
      query: `
        SELECT COUNT(*) as count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
          'subscriptions', 'usage_tracking', 'vs_customers', 
          'vs_prices', 'vs_subscriptions', 'vs_usage_records'
        )
      `,
      minCount: 6,
      description: 'Stripe and subscription management tables'
    },
    {
      name: 'RLS Policies Enabled',
      query: `
        SELECT COUNT(*) as count
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        WHERE t.schemaname = 'public'
        AND t.tablename LIKE 'vs_%'
        AND c.relrowsecurity = true
      `,
      minCount: 10,
      description: 'Tables with Row Level Security enabled'
    },
    {
      name: 'Database Functions',
      query: `
        SELECT COUNT(*) as count
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname IN (
          'check_usage_limit', 'get_user_subscription_limits',
          'user_has_feature_access', 'track_usage', 'update_updated_at'
        )
      `,
      minCount: 5,
      description: 'Key database functions'
    },
    {
      name: 'Foreign Key Constraints',
      query: `
        SELECT COUNT(*) as count
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
        AND constraint_type = 'FOREIGN KEY'
        AND table_name LIKE 'vs_%'
      `,
      minCount: 10,
      description: 'Foreign key relationships'
    },
    {
      name: 'Indexes',
      query: `
        SELECT COUNT(*) as count
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename LIKE 'vs_%'
      `,
      minCount: 20,
      description: 'Database indexes for performance'
    }
  ];

  console.log('📊 Running Verification Checks...\n');
  console.log('─'.repeat(60));

  let allPassed = true;
  const results = [];

  for (const verification of verifications) {
    try {
      const result = await client.query(verification.query);
      const count = parseInt(result.rows[0].count);
      const passed = count >= verification.minCount;
      
      if (!passed) {
        allPassed = false;
      }

      const status = passed ? '✅ PASS' : '❌ FAIL';
      const icon = passed ? '✅' : '❌';
      
      console.log(`${icon} ${verification.name}`);
      console.log(`   Count: ${count} (minimum: ${verification.minCount})`);
      console.log(`   Status: ${status}`);
      console.log(`   Description: ${verification.description}`);
      console.log('');

      results.push({
        name: verification.name,
        count,
        minCount: verification.minCount,
        passed,
        description: verification.description
      });
    } catch (error) {
      console.log(`❌ ${verification.name}`);
      console.log(`   Error: ${error.message}`);
      console.log('');
      allPassed = false;
      results.push({
        name: verification.name,
        count: 0,
        minCount: verification.minCount,
        passed: false,
        error: error.message
      });
    }
  }

  console.log('─'.repeat(60));
  console.log('');

  // List all vs_ tables
  console.log('📋 Core Tables Found:');
  try {
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'vs_%'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    } else {
      console.log('   ⚠️  No vs_ tables found');
    }
  } catch (error) {
    console.log(`   ❌ Error listing tables: ${error.message}`);
  }

  console.log('');

  // Summary
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.log('📊 Verification Summary:');
  console.log(`   ✅ Passed: ${passedCount}/${totalCount}`);
  console.log(`   ❌ Failed: ${totalCount - passedCount}/${totalCount}`);
  console.log('');

  if (allPassed) {
    console.log('🎉 All verification checks passed!');
    console.log('✅ Database migrations are complete and verified.');
  } else {
    console.log('⚠️  Some verification checks failed.');
    console.log('   Please review the results above and check the database.');
  }

  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Review the verification results above');
  console.log('   2. Test critical application flows');
  console.log('   3. Check Supabase Dashboard → Database → Linter for warnings');
  console.log('   4. Monitor application logs for any errors');

} catch (error) {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
} finally {
  await client.end();
  console.log('\n🔌 Database connection closed.');
}

