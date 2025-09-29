#!/usr/bin/env node

/**
 * Type Synchronization Script for Remote Supabase
 *
 * This script syncs TypeScript types between local development and remote Supabase
 * ensuring type safety across production and development environments.
 *
 * Features:
 * - Remote schema introspection
 * - Type diff validation
 * - Selective schema sync
 * - Change summary reporting
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT_DIR = path.join(process.argv[1], '../..');

/**
 * Sync types from remote Supabase project
 */
async function syncFromRemote() {
  console.log('🔄 Syncing types from remote Supabase...\n');

  const projectId = process.env.SUPABASE_PROJECT_ID || getProjectIdFromConfig();

  if (!projectId) {
    console.error('❌ No Supabase project ID found. Set SUPABASE_PROJECT_ID env var or configure in supabase/config.toml');
    process.exit(1);
  }

  // Schema configurations
  const schemas = [
    {
      name: 'public',
      localPath: 'src/types/database.types.ts',
      remoteCommand: `npx supabase gen types typescript --project-id ${projectId}`,
      description: 'Public database schema'
    },
    {
      name: 'auth',
      localPath: 'schemas/auth.types.ts',
      remoteCommand: `npx supabase gen types typescript --project-id ${projectId} --schema auth`,
      description: 'Auth schema types'
    },
    {
      name: 'storage',
      localPath: 'schemas/storage.types.ts',
      remoteCommand: `npx supabase gen types typescript --project-id ${projectId} --schema storage`,
      description: 'Storage schema types'
    }
  ];

  const changes = [];

  for (const schema of schemas) {
    console.log(`📡 Fetching ${schema.description} from remote...`);

    try {
      // Generate remote types
      const remoteTypes = execSync(schema.remoteCommand, {
        encoding: 'utf8',
        cwd: ROOT_DIR
      });

      // Check for local changes
      const localPath = path.join(ROOT_DIR, schema.localPath);
      let hasLocalChanges = false;

      if (fs.existsSync(localPath)) {
        const localContent = fs.readFileSync(localPath, 'utf8');
        const localChecksum = crypto.createHash('md5').update(localContent).digest('hex');
        const remoteChecksum = crypto.createHash('md5').update(remoteTypes).digest('hex');

        hasLocalChanges = localChecksum !== remoteChecksum;
      } else {
        hasLocalChanges = true; // New file
      }

      if (hasLocalChanges) {
        // Backup current version
        if (fs.existsSync(localPath)) {
          const backupPath = `${localPath}.backup`;
          fs.copyFileSync(localPath, backupPath);
          console.log(`💾 Backed up current ${schema.name} types`);
        }

        // Write new types with metadata
        const header = `// Auto-generated ${schema.description} - ${new Date().toISOString()}
// Sync from remote Supabase project: ${projectId}
// Schema: ${schema.name}
// DO NOT EDIT MANUALLY - Use npm run types:sync
\n`;

        const finalTypes = header + remoteTypes;
        fs.writeFileSync(localPath, finalTypes, 'utf8');

        changes.push({
          schema: schema.name,
          action: fs.existsSync(localPath.replace('.backup', '')) ? 'updated' : 'created',
          path: schema.localPath
        });

        console.log(`✅ ${schema.name} types ${changes[changes.length - 1].action}`);
      } else {
        console.log(`ℹ️  ${schema.name} types unchanged`);
      }

    } catch (error) {
      console.error(`❌ Failed to sync ${schema.name} schema:`, error.message);
      process.exit(1);
    }
  }

  // Validation
  console.log('\n🔍 Validating synced types...');
  try {
    execSync('npm run type-check', { cwd: ROOT_DIR, stdio: 'pipe' });
    console.log('✅ All synced types are valid');
  } catch (error) {
    console.error('❌ Type validation failed after sync!');
    console.error('Restoring backups...');

    // Restore backups on validation failure
    for (const change of changes) {
      const backupPath = path.join(ROOT_DIR, change.path + '.backup');
      const originalPath = path.join(ROOT_DIR, change.path);

      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, originalPath);
        console.log(`🔄 Restored ${change.schema} types from backup`);
      }
    }

    process.exit(1);
  }

  // Update freshness tracking
  updateTypeFreshness(changes);

  // Summary
  console.log('\n🎉 Type synchronization complete!');
  console.log('===================================');

  if (changes.length > 0) {
    console.log('📝 Changes made:');
    changes.forEach(change => {
      console.log(`   • ${change.schema}: ${change.action} (${change.path})`);
    });
    console.log('\n🔄 Please commit these type changes');
  } else {
    console.log('ℹ️  No type changes detected');
  }
}

/**
 * Push local types to remote (for schema deployment)
 */
async function pushToRemote() {
  console.log('⬆️  Pushing types to remote Supabase...\n');

  console.warn('⚠️  Push to remote is not yet implemented');
  console.warn('💡 This will be available when Supabase supports programmatic schema updates');
  console.log('📋 For now, deploy schema changes manually via:');
  console.log('   • Supabase Dashboard');
  console.log('   • Supabase CLI: supabase db push');

  // Future implementation would:
  // 1. Compare local schema with remote
  // 2. Generate migration for differences
  // 3. Deploy to remote Supabase
}

/**
 * Get project ID from Supabase config
 */
function getProjectIdFromConfig() {
  const configPath = path.join(ROOT_DIR, 'supabase/config.toml');
  if (!fs.existsSync(configPath)) return null;

  const config = fs.readFileSync(configPath, 'utf8');
  const projectIdMatch = config.match(/project_id\s*=\s*["']([^"']+)["']/);
  return projectIdMatch ? projectIdMatch[1] : null;
}

/**
 * Update type freshness validation file
 */
function updateTypeFreshness(changes) {
  const freshnessFile = path.join(ROOT_DIR, '.type-freshness.json');

  let freshnessData = {
    lastSynced: new Date().toISOString(),
    lastSource: 'remote',
    schemas: {},
    version: '1.0.0'
  };

  // Load existing data if available
  if (fs.existsSync(freshnessFile)) {
    freshnessData = { ...freshnessData, ...JSON.parse(fs.readFileSync(freshnessFile, 'utf8')) };
  }

  // Update sync timestamps
  changes.forEach(change => {
    freshnessData.schemas[change.schema] = {
      ...freshnessData.schemas[change.schema],
      syncedAt: new Date().toISOString(),
      source: 'remote'
    };
  });

  fs.writeFileSync(freshnessFile, JSON.stringify(freshnessData, null, 2));
}

/**
 * Show current sync status
 */
function showStatus() {
  console.log('📊 Type Synchronization Status');
  console.log('==============================\n');

  const freshnessFile = path.join(ROOT_DIR, '.type-freshness.json');

  if (!fs.existsSync(freshnessFile)) {
    console.log('❌ No sync tracking file found');
    console.log('💡 Run type sync first: npm run types:sync');
    return;
  }

  const freshnessData = JSON.parse(fs.readFileSync(freshnessFile, 'utf8'));
  const now = Date.now();

  console.log(`📅 Last synced: ${freshnessData.lastSynced || 'Never'}`);
  console.log(`🔗 Source: ${freshnessData.lastSource || 'Unknown'}`);

  console.log('\n📋 Schema Status:');
  const schemas = ['public', 'auth', 'storage'];

  schemas.forEach(schema => {
    const schemaData = freshnessData.schemas?.[schema];
    if (schemaData?.syncedAt) {
      const age = now - new Date(schemaData.syncedAt).getTime();
      const hoursAgo = Math.round(age / (1000 * 60 * 60));
      console.log(`   ✅ ${schema}: ${hoursAgo}h ago (${schemaData.source})`);
    } else {
      console.log(`   ❌ ${schema}: Never synced`);
    }
  });

  // Check freshness
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  if (freshnessData.lastSynced) {
    const age = now - new Date(freshnessData.lastSynced).getTime();
    if (age > maxAge) {
      console.log(`\n⚠️  Types may be stale! Consider running: npm run types:sync`);
    } else {
      console.log(`\n✅ Types are fresh`);
    }
  }
}

// Command routing
const command = process.argv[2];

switch (command) {
  case 'pull':
  case 'from-remote':
    syncFromRemote();
    break;

  case 'push':
  case 'to-remote':
    pushToRemote();
    break;

  case 'status':
    showStatus();
    break;

  default:
    console.log('📖 Type Synchronization Tool');
    console.log('===========================\n');
    console.log('Usage:');
    console.log('  npm run types:sync pull          - Sync types from remote');
    console.log('  npm run types:sync push          - Push types to remote (future)');
    console.log('  npm run types:sync status        - Show sync status');
    console.log('  npm run types:sync               - Default: pull from remote');
    console.log('\nEnvironment variables:');
    console.log('  SUPABASE_PROJECT_ID - Remote project ID (detected automatically if available)');
}
