#!/usr/bin/env node

/**
 * Setup Cron Job for Trial Management
 * Uses direct Postgres connection to set up the cron job
 * 
 * Usage:
 *   node scripts/setup-cron-job-with-connection.mjs
 * 
 * Environment Variables:
 *   POSTGRES_CONNECTION_STRING - Direct Postgres connection string
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for function authentication
 */

import pkg from 'pg';
const { Client } = pkg;

// SECURITY: These MUST be set via environment variables - no hardcoded credentials
const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;

// Validate required environment variables
if (!POSTGRES_CONNECTION_STRING) {
  console.error('❌ Error: POSTGRES_CONNECTION_STRING environment variable is required');
  console.error('   Get this from: Supabase Dashboard → Settings → Database → Connection string');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('   Get this from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

if (!PROJECT_REF) {
  console.error('❌ Error: SUPABASE_PROJECT_REF environment variable is required');
  console.error('   This is your Supabase project reference (found in your project URL)');
  process.exit(1);
}

async function setupCronJob() {
  const client = new Client({
    connectionString: POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Enable pg_cron extension
    console.log('📦 Enabling pg_cron extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS pg_cron;');
    console.log('✅ pg_cron extension enabled\n');

    // Drop existing job if it exists
    console.log('🧹 Checking for existing cron job...');
    const existingJob = await client.query(`
      SELECT jobid FROM cron.job WHERE jobname = 'trial-management-daily';
    `);

    if (existingJob.rows.length > 0) {
      console.log('⚠️  Existing cron job found, removing...');
      await client.query(`SELECT cron.unschedule('trial-management-daily');`);
      console.log('✅ Existing job removed\n');
    } else {
      console.log('✅ No existing job found\n');
    }

    // Schedule the cron job
    console.log('📅 Scheduling cron job...');
    console.log('   Name: trial-management-daily');
    console.log('   Schedule: 0 9 * * * (Daily at 9 AM UTC)');
    console.log('   Function: trial-cron\n');

    const cronSQL = `
      SELECT cron.schedule(
        'trial-management-daily',
        '0 9 * * *',
        $sql$
        SELECT net.http_post(
          url := 'https://${PROJECT_REF}.supabase.co/functions/v1/trial-cron',
          headers := jsonb_build_object(
            'Authorization', 'Bearer ${SUPABASE_SERVICE_ROLE_KEY}',
            'Content-Type', 'application/json'
          ),
          body := '{}'::jsonb
        ) AS response;
        $sql$
      );
    `;

    await client.query(cronSQL);
    console.log('✅ Cron job scheduled successfully!\n');

    // Verify the cron job
    console.log('🔍 Verifying cron job...');
    const verifyResult = await client.query(`
      SELECT 
        jobid,
        schedule,
        active,
        command
      FROM cron.job 
      WHERE jobname = 'trial-management-daily';
    `);

    if (verifyResult.rows.length > 0) {
      const job = verifyResult.rows[0];
      console.log('✅ Cron job verified:');
      console.log(`   Job ID: ${job.jobid}`);
      console.log(`   Schedule: ${job.schedule}`);
      console.log(`   Active: ${job.active}`);
      console.log('\n🎉 Cron job setup complete!');
    } else {
      console.log('⚠️  Warning: Cron job not found after creation');
    }

    console.log('\n📋 Next steps:');
    console.log('   1. Deploy edge functions (trial-cron must be deployed)');
    console.log('   2. Configure environment variables in Supabase Dashboard');
    console.log('   3. Test the cron job manually');

  } catch (error) {
    console.error('❌ Error setting up cron job:');
    console.error(`   ${error.message}`);
    
    if (error.message.includes('extension "pg_cron" does not exist')) {
      console.log('\n💡 Note: pg_cron extension may not be enabled on this database.');
      console.log('   Contact Supabase support or use the Dashboard method instead.');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupCronJob().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

