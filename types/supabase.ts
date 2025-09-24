export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      communications: {
        Row: {
          content: string
          created_at: string
          direction: string
          id: string
          lead_id: string
          message_id: string | null
          metadata: Json | null
          status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed'
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          direction: string
          id?: string
          lead_id: string
          message_id?: string | null
          metadata?: Json | null
          status?: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          direction?: string
          id?: string
          lead_id?: string
          message_id?: string | null
          metadata?: Json | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'communications_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            isNullable: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          status: string
          stripe_invoice_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: string
          status?: string
          stripe_invoice_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          status?: string
          stripe_invoice_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'invoices_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            isNullable: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          data: Json
          error: string | null
          id: string
          result: Json | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          error?: string | null
          id?: string
          result?: Json | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          error?: string | null
          id?: string
          result?: Json | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'jobs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            isNullable: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          contact_info: Json | null
          created_at: string
          email: string
          enriched_at: string | null
          follow_up_date: string | null
          id: string
          marketing_campaign: string | null
          message: string | null
          name: string
          phone: string | null
          score_data: Json | null
          site_id: string
          source: string
          status: 'new' | 'qualified' | 'contacted' | 'converted'
          tags: Json | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          contact_info?: Json | null
          created_at?: string
          email: string
          enriched_at?: string | null
          follow_up_date?: string | null
          id?: string
          marketing_campaign?: string | null
          message?: string | null
          name: string
          phone?: string | null
          score_data?: Json | null
          site_id: string
          source: string
          status?: 'new' | 'qualified' | 'contacted' | 'converted'
          tags?: Json | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          contact_info?: Json | null
          created_at?: string
          email?: string
          enriched_at?: string | null
          follow_up_date?: string | null
          id?: string
          marketing_campaign?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          score_data?: Json | null
          site_id?: string
          source?: string
          status?: 'new' | 'qualified' | 'contacted' | 'converted'
          tags?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'leads_site_id_fkey'
            columns: ['site_id']
            isOneToOne: false
            isNullable: false
            referencedRelation: 'sites'
            referencedColumns: ['id']
          },
        ]
      }
      sites: {
        Row: {
          created_at: string
          domain: string | null
          github_repo: string | null
          id: string
          leads_count: number
          name: string
          netlify_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          github_repo?: string | null
          id?: string
          leads_count?: number
          name: string
          netlify_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          github_repo?: string | null
          id?: string
          leads_count?: number
          name?: string
          netlify_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sites_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            isNullable: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          gateway_credentials: Json | null
          id: string
          preferred_gateway: string
          stripe_id: string | null
          twilio_sid: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          gateway_credentials?: Json | null
          id?: string
          preferred_gateway?: string
          stripe_id?: string | null
          twilio_sid?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          gateway_credentials?: Json | null
          id?: string
          preferred_gateway?: string
          stripe_id?: string | null
          twilio_sid?: string | null
          updated_at?: string
        }
        Relationships: []
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
