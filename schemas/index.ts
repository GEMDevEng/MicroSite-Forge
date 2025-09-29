// Consolidated database type exports
// This file merges all schema types for unified type exports

import type { Database } from '../src/types/database.types';
import type { AuthTypes } from './auth.types';
import type { StorageTypes } from './storage.types';

export type { Database, Tables, TablesInsert, TablesUpdate, Enums, CompositeTypes } from '../src/types/database.types';
export type { AuthTypes } from './auth.types';
export type { StorageTypes } from './storage.types';

// Re-export Supabase client types for convenience
export type { SupabaseClient, User, Session } from '@supabase/supabase-js';

// Type helpers for schema-specific operations
export type SchemaName = 'public' | 'auth' | 'storage';

export type SchemaTypes<T extends SchemaName> =
  T extends 'public' ? Database['public'] :
  T extends 'auth' ? AuthTypes :
  T extends 'storage' ? StorageTypes :
  never;

// Type guard for schema validation
export const isValidSchema = (schema: string): schema is SchemaName => {
  return ['public', 'auth', 'storage'].includes(schema);
};
