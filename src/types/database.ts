export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PaymentGatewayType = 'stripe' | 'paypal' | 'adyen' | 'square' | 'authorize_net'

export interface ContactInfo {
  name: string
  email: string
  phone?: string
  company?: string
  title?: string
  location?: string
  website?: string
  social_profiles?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  enriched_data?: {
    company_size?: string
    industry?: string
    revenue_range?: string
    employee_count?: number
  }
}

export interface LeadScore {
  source: 'organic' | 'paid' | 'referral'
  engagement: number        // 0-100 based on site interaction
  intent_level: number      // 0-100 based on form completion depth
  budget_indicators: number // 0-100 keywords suggesting budget
  timeline_signals: number  // 0-100 urgency indicators
  total_score: number       // 0-100 overall score
}

export interface LeadData {
  id: string
  contact: ContactInfo
  score: LeadScore
  tags: string[]
  status: 'new' | 'qualified' | 'contacted' | 'converted'
  assigned_to?: string
  follow_up_date?: string
  marketing_campaign?: string
  enriched_at?: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          stripe_id: string | null
          twilio_sid: string | null
          preferred_gateway: PaymentGatewayType
          gateway_credentials: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          stripe_id?: string | null
          twilio_sid?: string | null
          preferred_gateway?: PaymentGatewayType
          gateway_credentials?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          stripe_id?: string | null
          twilio_sid?: string | null
          preferred_gateway?: PaymentGatewayType
          gateway_credentials?: Json | null
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
          status: 'new' | 'qualified' | 'contacted' | 'converted'
          score_data: Json | null  // LeadScore
          contact_info: Json | null // ContactInfo
          tags: Json | null  // string[]
          assigned_to: string | null
          follow_up_date: string | null
          marketing_campaign: string | null
          enriched_at: string | null
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
          status?: 'new' | 'qualified' | 'contacted' | 'converted'
          score_data?: Json | null
          contact_info?: Json | null
          tags?: Json | null
          assigned_to?: string | null
          follow_up_date?: string | null
          marketing_campaign?: string | null
          enriched_at?: string | null
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
          status?: 'new' | 'qualified' | 'contacted' | 'converted'
          score_data?: Json | null
          contact_info?: Json | null
          tags?: Json | null
          assigned_to?: string | null
          follow_up_date?: string | null
          marketing_campaign?: string | null
          enriched_at?: string | null
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
      communications: {
        Row: {
          id: string
          lead_id: string
          type: 'email' | 'sms' | 'call' | 'note'
          direction: 'inbound' | 'outbound'
          content: string
          status: 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked'
          message_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          type: 'email' | 'sms' | 'call' | 'note'
          direction: 'inbound' | 'outbound'
          content: string
          status?: 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked'
          message_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          type?: 'email' | 'sms' | 'call' | 'note'
          direction?: 'inbound' | 'outbound'
          content?: string
          status?: 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked'
          message_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_lead_id_fkey"
            columns: ["lead_id"]
            referencedRelation: "leads"
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
