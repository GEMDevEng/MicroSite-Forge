#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generate Row Level Security policies from JSON schema
 */

function generateRLS() {
  console.log('🛡️  Generating RLS policies...');

  // Read policies schema
  const policiesSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/policies.json'), 'utf8'));

  // Ensure supabase/migrations directory exists
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const rlsMigrationFile = path.join(migrationsDir, `${timestamp}_rls_policies.sql`);

  let rlsSQL = `-- RLS Policies Migration
-- Generated on: ${new Date().toISOString()}

-- Enable Row Level Security on all tables
`;

  // First enable RLS on all tables
  const tables = Object.keys(policiesSchema);
  tables.forEach(tableName => {
    rlsSQL += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n`;
  });

  rlsSQL += '\n-- Drop existing policies (for clean recreation)\n';
  tables.forEach(tableName => {
    rlsSQL += `DROP POLICY IF EXISTS "Users can view own ${tableName}" ON ${tableName};\n`;
    rlsSQL += `DROP POLICY IF EXISTS "Users can insert own ${tableName}" ON ${tableName};\n`;
    rlsSQL += `DROP POLICY IF EXISTS "Users can update own ${tableName}" ON ${tableName};\n`;
    rlsSQL += `DROP POLICY IF EXISTS "Users can delete own ${tableName}" ON ${tableName};\n`;
  });

  rlsSQL += '\n-- Create new RLS policies\n';

  // Generate policies for each table
  for (const [tableName, policies] of Object.entries(policiesSchema)) {
    policies.forEach((policy, index) => {
      const policyName = policy.name.replace(/\s+/g, '_').toLowerCase();
      rlsSQL += `-- Policy: ${policy.name}\n`;
      rlsSQL += `CREATE POLICY "${policy.name}" ON ${tableName}\n`;
      rlsSQL += `  FOR ${policy.action}\n`;
      rlsSQL += `  USING (${policy.condition});\n\n`;
    });
  }

  // Write RLS migration file
  fs.writeFileSync(rlsMigrationFile, rlsSQL);

  console.log(`✅ RLS migration file created: ${rlsMigrationFile}`);
  console.log('🛡️  RLS policy generation complete!');
}

generateRLS();
