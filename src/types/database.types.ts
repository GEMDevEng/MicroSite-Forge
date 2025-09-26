export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      communications: {
        Row: {
          id: string
          lead_id: string
          type: 'email' | 'sms' | 'call' | 'note'
          direction: 'inbound' | 'outbound'
          content: string
          status: string | null
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
          status?: string | null
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
          status?: string | null
          message_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
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
          currency: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_invoice_id: string
          amount: number
          currency?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_invoice_id?: string
          amount?: number
          currency?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          type: string
          status: string | null
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
          status?: string | null
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
          status?: string | null
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
            isOneToOne: false
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
          source: string | null
          status: string | null
          score_data: Json | null
          contact_info: Json | null
          tags: Json | null
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
          source?: string | null
          status?: string | null
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
          source?: string | null
          status?: string | null
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
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          }
        ]
      }
      sites: {
        Row: {
          id: string
          user_id: string
          name: string
          domain: string | null
          status: string | null
          github_repo: string | null
          netlify_url: string | null
          leads_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          domain?: string | null
          status?: string | null
          github_repo?: string | null
          netlify_url?: string | null
          leads_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          domain?: string | null
          status?: string | null
          github_repo?: string | null
          netlify_url?: string | null
          leads_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          stripe_id: string | null
          twilio_sid: string | null
          preferred_gateway: string | null
          gateway_credentials: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          stripe_id?: string | null
          twilio_sid?: string | null
          preferred_gateway?: string | null
          gateway_credentials?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          stripe_id?: string | null
          twilio_sid?: string | null
          preferred_gateway?: string | null
          gateway_credentials?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      user_sites_stats: {
        Row: {
          user_id: string | null
          email: string | null
          sites_count: number | null
          total_leads_count: number | null
          live_sites_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_total_leads: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
