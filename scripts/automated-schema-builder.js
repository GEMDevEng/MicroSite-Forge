#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Automated schema builder - orchestrates the entire schema creation and deployment process
 */

async function runAutomatedSchemaBuilder() {
  console.log('🤖 Starting Automated MicroSite Schema Builder');
  console.log('==========================================\n');

  const rootDir = path.join(process.argv[1], '../..');

  try {
    // Phase 1: Install Supabase CLI
    console.log('📦 Phase 1: Installing Supabase CLI...');
    try {
      execSync('npx supabase --version', { stdio: 'pipe' });
      console.log('✅ Supabase CLI already installed\n');
    } catch (error) {
      console.log('Installing Supabase CLI...');
      execSync('npm install -g supabase', { stdio: 'inherit' });
      console.log('✅ Supabase CLI installed\n');
    }

    // Phase 2: Generate migrations
    console.log('📝 Phase 2: Generating migration files...');
    execSync('node scripts/generate-migration.js', {
      stdio: 'inherit',
      cwd: rootDir
    });
    console.log('✅ Migration files generated\n');

    // Phase 3: Generate RLS policies
    console.log('🛡️  Phase 3: Generating RLS policies...');
    execSync('node scripts/generate-rls.js', {
      stdio: 'inherit',
      cwd: rootDir
    });
    console.log('✅ RLS policies generated\n');

    // Phase 4: Initialize and start Supabase
    console.log('🚀 Phase 4: Initializing Supabase...');
    const configPath = path.join(rootDir, 'supabase/config.toml');

    if (!fs.existsSync(configPath)) {
      execSync('npx supabase init', { stdio: 'inherit', cwd: rootDir });
    }

    try {
      execSync('npx supabase status', { stdio: 'pipe', cwd: rootDir });
      console.log('✅ Supabase already running');
    } catch (error) {
      console.log('Starting Supabase...');
      execSync('npx supabase start', { stdio: 'inherit', cwd: rootDir });
    }
    console.log('✅ Supabase initialized and running\n');

    // Phase 5: Deploy schema
    console.log('📤 Phase 5: Deploying schema...');
    execSync('node scripts/deploy-schema.js deploy', {
      stdio: 'inherit',
      cwd: rootDir
    });
    console.log('✅ Schema deployed\n');

    // Phase 6: Generate types
    console.log('� Phase 6: Generating TypeScript types...');
    execSync('npx supabase gen types typescript --local > src/types/database.types.ts', {
      stdio: 'inherit',
      cwd: rootDir
    });
    console.log('✅ TypeScript types generated\n');

    console.log('🎉 Automated Schema Builder Complete!');
    console.log('==========================================');
    console.log('');
    console.log('📋 What was created:');
    console.log('   • 6 database tables (users, sites, leads, communications, jobs, invoices)');
    console.log('   • Row Level Security policies for all tables');
    console.log('   • Database indexes for performance');
    console.log('   • Analytical view (user_sites_stats)');
    console.log('   • Utility functions');
    console.log('   • Sample seed data');
    console.log('');
    console.log('🌐 Access your database:');
    console.log('   • Supabase Studio: http://localhost:54323');
    console.log('   • Connection: postgresql://postgres:postgres@localhost:54322/postgres');
    console.log('');
    console.log('🔄 Next steps:');
    console.log('   • Review the generated schema in Supabase Studio');
    console.log('   • Test the RLS policies with different user contexts');
    console.log('   • Run tests to verify everything works as expected');

  } catch (error) {
    console.error('\n❌ Automated Schema Builder failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Make sure Docker is running');
    console.error('   • Check that ports 54322, 54323 are available');
    console.error('   • Try running: supabase stop && supabase start');
    console.error('   • Check logs: supabase logs');
    process.exit(1);
  }
}

runAutomatedSchemaBuilder().catch(console.error);
