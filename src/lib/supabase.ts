import { createClient } from './supabase/client'

// Re-export the new client for backward compatibility
export const supabase = createClient()
