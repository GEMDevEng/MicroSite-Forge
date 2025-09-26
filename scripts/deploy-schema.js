#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Deploy schema to Supabase using generated migrations
 */

function deploySchema() {
  console.log('🚀 Deploying schema to Supabase...');

  try {
    // Check if Supabase CLI is available
    execSync('npx supabase --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Supabase CLI not found. Please install it with: npm install -g supabase');
    process.exit(1);
  }

  try {
    // Check if Supabase is initialized
    const configPath = path.join(__dirname, '../supabase/config.toml');
    if (!fs.existsSync(configPath)) {
      console.log('📁 Supabase not initialized. Initializing...');
      execSync('supabase init', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    }

    // Start local Supabase if not running
    console.log('🔄 Ensuring Supabase is running...');
    try {
      execSync('supabase status', { stdio: 'pipe' });
      console.log('✅ Supabase is already running');
    } catch (error) {
      console.log('🚀 Starting Supabase...');
      execSync('supabase start', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    }

    // Run migrations
    console.log('📄 Running migrations...');
    execSync('supabase db push', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, SUPABASE_DB_PASSWORD: 'postgres' }
    });

    // Seed the database
    console.log('🌱 Seeding database...');
    const seedPath = path.join(__dirname, '../supabase/seed.sql');
    if (fs.existsSync(seedPath)) {
      execSync(`supabase db reset --linked`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      // Note: In a real deployment, you might want to run seed separately
      // execSync('supabase seed', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    }

    // Generate TypeScript types
    console.log('📝 Generating TypeScript types...');
    execSync('supabase gen types typescript --local > src/types/database.types.ts', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    console.log('🎉 Schema deployment complete!');
    console.log('🌐 Local Supabase Studio: http://localhost:54323');

  } catch (error) {
    console.error('❌ Schema deployment failed:', error.message);
    process.exit(1);
  }
}

function resetDatabase() {
  console.log('🔄 Resetting database...');

  try {
    execSync('supabase db reset --local', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  }
}

// CLI interface
const command = process.argv[2];

if (command === 'reset') {
  resetDatabase();
} else if (command === 'deploy' || !command) {
  deploySchema();
} else {
  console.log('Usage: node deploy-schema.js [deploy|reset]');
  console.log('  deploy (default): Deploy schema to Supabase');
  console.log('  reset: Reset the local database');
  process.exit(1);
}
