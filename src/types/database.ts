export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          stripe_id: string | null
          twilio_sid: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          stripe_id?: string | null
          twilio_sid?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          stripe_id?: string | null
          twilio_sid?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          id: string
          user_id: string
          name: string
          domain: string | null
          status: 'pending' | 'live' | 'error'
          github_repo: string | null
          netlify_url: string | null
          leads_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          domain?: string | null
          status?: 'pending' | 'live' | 'error'
          github_repo?: string | null
          netlify_url?: string | null
          leads_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          domain?: string | null
          status?: 'pending' | 'live' | 'error'
          github_repo?: string | null
          netlify_url?: string | null
          leads_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      leads: {
        Row: {
          id: string
          site_id: string
          name: string
          email: string
          phone: string | null
          message: string | null
          source: string
          status: 'new' | 'contacted' | 'qualified' | 'converted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          name: string
          email: string
          phone?: string | null
          message?: string | null
          source: string
          status?: 'new' | 'contacted' | 'qualified' | 'converted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          name?: string
          email?: string
          phone?: string | null
          message?: string | null
          source?: string
          status?: 'new' | 'contacted' | 'qualified' | 'converted'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_site_id_fkey"
            columns: ["site_id"]
            referencedRelation: "sites"
            referencedColumns: ["id"]
          }
        ]
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          type: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          data: Json
          result: Json | null
          error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          data: Json
          result?: Json | null
          error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          data?: Json
          result?: Json | null
          error?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          stripe_invoice_id: string
          amount: number
          currency: string
          status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_invoice_id: string
          amount: number
          currency: string
          status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_invoice_id?: string
          amount?: number
          currency?: string
          status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
