#!/usr/bin/env node

import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:YOUR_DB_PASSWORD@db.nuwfdvwqiynzhbbsqagw.supabase.co:5432/postgres";

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check if old tables exist
    const oldTables = ['supply_chain_assessments', 'vendors', 'sbom_analyses', 'profiles', 'contact_submissions'];
    const newTables = ['vs_supply_chain_assessments', 'vs_vendors', 'vs_sbom_analyses', 'vs_profiles', 'vs_contact_submissions'];
    
    console.log('📋 Checking table existence...\n');
    
    for (const table of [...oldTables, ...newTables]) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      
      const exists = result.rows[0].exists;
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${table}`);
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();

