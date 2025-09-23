// Consolidated Lead Types and Interfaces
import { ContactInfo, LeadScore } from './database'

export interface IncomingLead {
  site_id: string
  name: string
  email: string
  phone?: string
  message?: string
  source: string
}

export interface EnrichedLeadData {
  company?: string
  title?: string
  location?: string
  industry?: string
  companySize?: string
  socialProfiles?: {
    linkedin?: string
    twitter?: string
  }
}

export type LeadStatus = 'new' | 'qualified' | 'contacted' | 'converted'
export type CommunicationType = 'email' | 'sms' | 'call' | 'note'

export interface TeamMember {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'agent' | 'junior'
  capacity: number
  assigned_leads: number
  skills: string[]
  location: string
  timezone: string
  availability_status: 'available' | 'busy' | 'offline'
  last_assignment: string
  performance_score: number
}

export interface CommunicationLog {
  id: string
  lead_id: string
  type: CommunicationType
  direction: 'inbound' | 'outbound'
  content: string
  status: 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked'
  message_id?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface LeadData {
  id: string
  contact: ContactInfo
  score: LeadScore
  tags?: string[]
  status: LeadStatus
  assigned_to?: string | null
  follow_up_date?: string | null
  marketing_campaign?: string | null
  enriched_at?: string | null
  created_at: string
  updated_at: string
}

export interface LeadFilterOptions {
  status?: LeadStatus
  source?: string
  siteId?: string
  searchTerm?: string
  assignedTo?: string
  dateRange?: {
    from: string
    to: string
  }
  scoreRange?: {
    min: number
    max: number
  }
}

export interface LeadStats {
  total: number
  new: number
  qualified: number
  contacted: number
  converted: number
  conversionRate: number
  averageScore: number
}

export interface AssignmentRecommendation {
  member: TeamMember
  score: number
  reasoning: string
  confidence: number
}

export interface AssignmentResult {
  success: boolean
  assignedTo?: string
  assignmentType: 'intelligent' | 'round-robin' | 'manual'
  recommendations?: AssignmentRecommendation[]
  error?: string
}
