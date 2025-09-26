#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generate Supabase migration files from JSON schema
 */

function generateMigration() {
  console.log('🚀 Generating migration files from schema...');

  // Read schema files
  const tablesSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/tables.json'), 'utf8'));
  const policiesSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/policies.json'), 'utf8'));

  // Ensure supabase/migrations directory exists
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const migrationFile = path.join(migrationsDir, `${timestamp}_microsite_schema.sql`);

  let migrationSQL = `-- Migration: MicroSite Database Schema
-- Generated on: ${new Date().toISOString()}

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
`;

  // Generate table creation SQL
  for (const [tableName, tableDef] of Object.entries(tablesSchema)) {
    migrationSQL += `\n-- Create ${tableName} table\n`;
    migrationSQL += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

    const columns = [];
    for (const [colName, colDef] of Object.entries(tableDef.columns)) {
      let colSQL = `  ${colName}`;

      // Determine column type
      if (colDef.pg_type) {
        colSQL += ` ${colDef.pg_type}`;
      } else if (colDef.type) {
        colSQL += ` ${colDef.type}`;
      }

      // Handle constraints
      if (colDef.not_null || colDef.is_nullable === false) {
        colSQL += ' NOT NULL';
      }
      if (colDef.is_primary) {
        colSQL += ' PRIMARY KEY';
      }
      if (colDef.default_value || colDef.default) {
        const defaultVal = colDef.default_value || colDef.default;
        colSQL += ` DEFAULT ${defaultVal}`;
      }

      columns.push(colSQL);
    }

    migrationSQL += columns.join(',\n');
    migrationSQL += '\n);\n\n';

    // Add foreign keys
    for (const [colName, colDef] of Object.entries(tableDef.columns)) {
      if (colDef.references) {
        const refMatch = colDef.references.match(/(.+)\.(.+)\((.+)\)/);
        if (refMatch) {
          const [, refSchema, refTable, refColumn] = refMatch;
          migrationSQL += `ALTER TABLE ${tableName} ADD CONSTRAINT ${tableName}_${colName}_fkey FOREIGN KEY (${colName}) REFERENCES ${refSchema}.${refTable}(${refColumn});\n`;
        }
      } else if (colDef.foreign_key_name) {
        // Handle the format from the original schema
        const refMatch = colDef.foreign_key_name.match(/(.+)_(.+)_fkey/);
        if (refMatch && colDef.referenced_table) {
          migrationSQL += `ALTER TABLE ${tableName} ADD CONSTRAINT ${colDef.foreign_key_name} FOREIGN KEY (${colDef.columns || [colName]}) REFERENCES ${colDef.referenced_schema || 'public'}.${colDef.referenced_table}(${colDef.referenced_columns || ['id']});\n`;
        }
      }
    }

    // Generate indexes
    if (tableDef.indexes && tableDef.indexes.length > 0) {
      migrationSQL += '\n-- Create indexes for ' + tableName + '\n';
      tableDef.indexes.forEach(indexSQL => {
        migrationSQL += `${indexSQL};\n`;
      });
      migrationSQL += '\n';
    }
  }

  // Enable RLS on all tables
  migrationSQL += '-- Enable Row Level Security\n';
  for (const tableName of Object.keys(tablesSchema)) {
    migrationSQL += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n`;
  }
  migrationSQL += '\n';

  // Generate policies
  migrationSQL += '-- Create Row Level Security policies\n';
  for (const [tableName, policies] of Object.entries(policiesSchema)) {
    policies.forEach((policy, index) => {
      const policyName = policy.name.replace(/\s+/g, '_').toLowerCase();
      migrationSQL += `CREATE POLICY "${policy.name}" ON ${tableName} FOR ${policy.action} USING (${policy.condition});\n`;
    });
  }
  migrationSQL += '\n';

  // Add Updated at trigger function
  migrationSQL += `-- Create trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
`;

  // Create triggers for tables with updated_at columns
  for (const [tableName, tableDef] of Object.entries(tablesSchema)) {
    if (tableDef.columns.updated_at) {
      migrationSQL += `CREATE TRIGGER update_${tableName}_updated_at BEFORE UPDATE ON ${tableName} FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();\n`;
    }
  }

  // Add view creation
  migrationSQL += '\n-- Create analytical views\n';
  migrationSQL += `CREATE OR REPLACE VIEW user_sites_stats AS
SELECT
  u.id as user_id,
  u.email,
  COUNT(DISTINCT s.id) as sites_count,
  COALESCE(SUM(s.leads_count), 0) as total_leads_count,
  COUNT(DISTINCT CASE WHEN s.status = 'live' THEN s.id END) as live_sites_count
FROM users u
LEFT JOIN sites s ON u.id = s.user_id
GROUP BY u.id, u.email;

-- Create utility functions
CREATE OR REPLACE FUNCTION get_user_total_leads(user_uuid UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN COALESCE((
    SELECT SUM(leads_count)
    FROM sites
    WHERE user_id = user_uuid
  ), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

  // Write migration file
  fs.writeFileSync(migrationFile, migrationSQL);

  console.log(`✅ Migration file created: ${migrationFile}`);
  console.log('🎉 Migration generation complete!');
}

generateMigration();
