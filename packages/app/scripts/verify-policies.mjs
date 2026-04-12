#!/usr/bin/env node

/**
 * Verify RLS Policies
 * Checks current RLS policies for assets, profiles, and vs_profiles tables
 */

import pkg from 'pg';
const { Client } = pkg;

const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING || 
  "postgresql://postgres:YOUR_DB_PASSWORD@db.dfklqsdfycwjlcasfciu.supabase.co:5432/postgres";

async function verifyPolicies() {
  const client = new Client({
    connectionString: POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to database\n');

    // Check for duplicate policies
    const result = await client.query(`
      SELECT 
        tablename, 
        cmd,
        COUNT(*) as policy_count,
        array_agg(policyname ORDER BY policyname) as policy_names
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename IN ('assets', 'profiles', 'vs_profiles')
      AND ('authenticated' = ANY(roles) OR roles IS NULL)
      GROUP BY tablename, cmd
      HAVING COUNT(*) > 1
      ORDER BY tablename, cmd;
    `);

    if (result.rows.length === 0) {
      console.log('✅ No duplicate policies found! All tables have single policies per action.\n');
    } else {
      console.log('⚠️  Duplicate policies found:\n');
      result.rows.forEach(row => {
        console.log(`   ${row.tablename} (${row.cmd}): ${row.policy_count} policies`);
        row.policy_names.forEach(name => console.log(`      - ${name}`));
      });
      console.log('');
    }

    // Show all policies for these tables
    const allPolicies = await client.query(`
      SELECT 
        tablename, 
        policyname, 
        cmd, 
        roles
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename IN ('assets', 'profiles', 'vs_profiles')
      AND ('authenticated' = ANY(roles) OR roles IS NULL)
      ORDER BY tablename, cmd, policyname;
    `);

    console.log('📋 Current RLS Policies:\n');
    let currentTable = '';
    let currentCmd = '';
    allPolicies.rows.forEach(row => {
      if (row.tablename !== currentTable) {
        currentTable = row.tablename;
        currentCmd = '';
        console.log(`\n${row.tablename.toUpperCase()}:`);
      }
      if (row.cmd !== currentCmd) {
        currentCmd = row.cmd;
        console.log(`  ${row.cmd}:`);
      }
      console.log(`    - ${row.policyname}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyPolicies().catch(console.error);

