import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TYPES_DIR = path.join(__dirname, '../types/generated'); // Adjust to your types output dir
const FRESHNESS_FILE = path.join(TYPES_DIR, '.type-freshness.json'); // Or wherever it lives

function loadFreshness() {
  try {
    return JSON.parse(fs.readFileSync(FRESHNESS_FILE, 'utf8'));
  } catch {
    return { lastGenerated: null };
  }
}

/**
 * Process and clean auth schema types
 */
function processAuthTypes(typesOutput) {
  // Extract only auth-related types and clean them up
  return `export type AuthTypes = {
  // Auth schema types will be populated from Supabase auth introspection
  users: any; // Extend as needed based on auth schema
  sessions: any;
  refresh_tokens: any;
  // Add more auth types as required
}

// Re-export common auth types from Supabase JS
export type { User, Session } from '@supabase/supabase-js';
`;
}

/**
 * Process and clean storage schema types
 */
function processStorageTypes(typesOutput) {
  // Extract only storage-related types and clean them up
  return `export type StorageTypes = {
  // Storage schema types will be populated from Supabase storage introspection
  buckets: any; // Storage buckets
  objects: any; // Storage objects
  // Add more storage types as required
}

// Re-export storage types from Supabase JS
export type { FileObject, FileOptions } from '@supabase/storage-js';
`;
}

/**
 * Check if database is running and accessible
 */
function checkDatabaseConnectivity() {
  console.log('🔍 Checking database connectivity...');
  try {
    // Check if we have remote Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Missing Supabase environment variables.');
      console.error('💡 Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
      return false;
    }

    // Try a simple health check with the database URL
    try {
      execSync(`curl -s -H "apikey: ${serviceRoleKey}" "${supabaseUrl}/rest/v1/" | head -1 > /dev/null`, { stdio: 'pipe' });
      console.log('✅ Database is accessible');
      return true;
    } catch (healthCheckError) {
      console.error('❌ Database health check failed');
      console.error('💡 Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct');
      return false;
    }
  } catch (error) {
    console.error('❌ Database connectivity check failed');
    console.error('💡 Check your environment variables and network connection');
    return false;
  }
}

function saveFreshness(timestamp = new Date().toISOString()) {
  fs.mkdirSync(path.dirname(FRESHNESS_FILE), { recursive: true });
  fs.writeFileSync(FRESHNESS_FILE, JSON.stringify({ lastGenerated: timestamp }, null, 2));
}

function isStale(maxAgeHours, lastGenerated) {
  if (!lastGenerated) return true;
  const now = new Date();
  const last = new Date(lastGenerated);
  const ageHours = (now - last) / (1000 * 60 * 60);
  return ageHours > maxAgeHours;
}

function generateTypes() {
  const SCHEMAS = {
    public: {
      outputPath: 'src/types/database.types.ts',
      description: 'Public database schema types'
    },
    auth: {
      outputPath: 'schemas/auth.types.ts',
      description: 'Authentication schema types',
      schema: 'auth'
    },
    storage: {
      outputPath: 'schemas/storage.types.ts',
      description: 'Storage schema types',
      schema: 'storage'
    }
  };

  console.log('🚀 Starting type generation');
  console.log('===========================================\n');

  // Check prerequisites
  if (!checkDatabaseConnectivity()) {
    console.log('⚠️  Database connectivity check failed, proceeding anyway...');
  }

  // Generate schemas
  for (const [schemaName, config] of Object.entries(SCHEMAS)) {
    try {
      console.log(`📝 Generating ${schemaName} schema types...`);
      const outputPath = path.join(process.cwd(), config.outputPath);
      const schema = config.schema || 'public';

      // Get database URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing SUPABASE credentials');
      }

      const supabaseRef = supabaseUrl.replace(/^https?:\/\/([^.]+)\.supabase\.co$/, '$1');
      const dbUrl = `postgresql://postgres:${serviceRoleKey}@db.${supabaseRef}.supabase.co:5432/postgres`;

      let command = `npx supabase gen types typescript --db-url "${dbUrl}" --schema ${schema}`;

      const typesOutput = execSync(command, { encoding: 'utf8', cwd: process.cwd() });

      let processedTypes = typesOutput;
      if (schemaName === 'auth') {
        processedTypes = processAuthTypes(typesOutput);
      } else if (schemaName === 'storage') {
        processedTypes = processStorageTypes(typesOutput);
      }

      const header = `// Auto-generated ${config.description} - ${new Date().toISOString()}
// Generated from Supabase database introspection
// DO NOT EDIT MANUALLY - Use npm run types:generate
`;
      const finalTypes = header + '\n' + processedTypes;
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, finalTypes, 'utf8');

      console.log(`✅ ${schemaName} types generated`);
    } catch (error) {
      console.error(`❌ Failed to generate ${schemaName} types:`, error.message);
      throw error;
    }
  }

  saveFreshness();
  console.log('\n🎉 Type generation complete!');
}

function checkFreshness(mode = 'strict') {
  const isCI = !!process.env.CI || !!process.env.VERCEL;
  const maxAge = isCI ? 168 : 0; // 7 days in CI, 0 in local
  const freshness = loadFreshness();
  const lastGenerated = freshness.lastGenerated;

  console.log('🔍 Checking type freshness...');
  console.log(`ℹ️  Max age: ${maxAge} hours, Mode: ${mode}${isCI ? ' (CI mode)' : ''}`);

  const stale = isStale(maxAge, lastGenerated);
  const ageHours = lastGenerated ? Math.round((new Date() - new Date(lastGenerated)) / (1000 * 60 * 60)) : 'unknown';

  if (stale) {
    console.log(`⚠️  Types are stale! Last generated ${ageHours} hours ago`);
    console.log('💡 Run: npm run types:generate');

    if (isCI && mode !== 'warn-only') {
      // In CI, auto-regenerate if not warn-only
      console.log('🔄 Auto-regenerating types in CI...');
      generateTypes();
      // Re-check after gen
      const newFreshness = loadFreshness();
      const stillStale = isStale(maxAge, newFreshness.lastGenerated);
      if (stillStale) {
        console.error('❌ Auto-regeneration failed; check generation logic.');
        process.exit(1);
      }
      console.log('✅ Auto-regeneration successful.');
      return;
    }

    if (mode === 'strict') {
      console.error('❌ Freshness check failed in strict mode.');
      process.exit(1);
    } else {
      // warn-only: log and continue
      console.log('(warning only, continuing...)');
      return;
    }
  } else {
    console.log(`✅ Types are fresh! Last generated ${ageHours} hours ago.`);
  }
}

// CLI handling
const args = process.argv.slice(2);
if (args.includes('check-freshness')) {
  const mode = args.includes('warn-only') ? 'warn-only' : 'strict'; // Pass mode via arg if needed, or detect from env
  checkFreshness(mode);
} else {
  // Default: generate mode
  generateTypes();
}

export { generateTypes, checkFreshness }; // For testing/import
