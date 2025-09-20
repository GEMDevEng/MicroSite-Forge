import { supabase } from './supabase'
import { LeadData, LeadScore, ContactInfo, Database } from '../types/database'
import { logger } from './logger'

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

export class LeadScorer {
  static calculateScore(incomingLead: IncomingLead): LeadScore {
    let engagement = 20 // Base engagement
    let intentLevel = 0
    let budgetIndicators = 0
    let timelineSignals = 0

    // Source-based scoring
    const source = incomingLead.source.toLowerCase()
    const sourceScore = source.includes('paid') ? 'paid' :
                       source.includes('organic') ? 'organic' :
                       source.includes('referral') ? 'referral' : 'organic'

    // Engagement scoring based on provided fields
    if (incomingLead.phone) engagement += 20
    if (incomingLead.message && incomingLead.message.length > 20) engagement += 15
    if (incomingLead.name.includes(' ')) engagement += 10 // Full name

    // Intent level based on form completion
    const fieldsFilled = [incomingLead.phone, incomingLead.message].filter(Boolean).length
    intentLevel = Math.min(100, fieldsFilled * 25 + 25)

    // Budget indicators from keywords in message/name/source
    const text = `${incomingLead.message || ''} ${incomingLead.name}`.toLowerCase()
    if (text.includes('price') || text.includes('cost') || text.includes('budget') || text.includes('affordable')) {
      budgetIndicators = 40
    }
    if (text.includes('buying') || text.includes('purchase') || text.includes('ready to start')) {
      budgetIndicators = Math.max(budgetIndicators, 70)
    }

    // Timeline signals
    if (text.includes('urgent') || text.includes('asap') || text.includes('today') || text.includes('now')) {
      timelineSignals = 80
    } else if (text.includes('soon') || text.includes('next week') || text.includes('month')) {
      timelineSignals = 50
    }

    const totalScore = Math.round((engagement + intentLevel + budgetIndicators + timelineSignals) / 4)

    return {
      source: sourceScore,
      engagement: Math.min(100, engagement),
      intent_level: intentLevel,
      budget_indicators: Math.min(100, budgetIndicators),
      timeline_signals: Math.min(100, timelineSignals),
      total_score: Math.min(100, totalScore)
    }
  }
}

export class LeadEnrichment {
  async enrichLead(leadId: string): Promise<void> {
    try {
      // Get lead data
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (leadError || !lead) {
        logger.error('Failed to fetch lead for enrichment', leadError || new Error('Unknown error'), { leadId })
        return
      }

      // Simple mock enrichment for now - in production, integrate with Clearbit, Hunter.io, etc.
      const enrichedData: EnrichedLeadData = {
        company: this.extractCompanyFromEmail(lead.email),
        location: 'Unknown', // Would use IP geolocation
        industry: 'Unknown'  // Would use company data APIs
      }

      // Update lead with enriched data
      const contactInfo: ContactInfo = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone || undefined,
        company: enrichedData.company
      }

      const { error: updateError } = await supabase
        .from('leads')
        .update({
          contact_info: contactInfo,
          enriched_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (updateError) {
        logger.error('Failed to update enriched lead data', updateError, { leadId })
      } else {
        logger.info('Lead enriched successfully', { leadId, company: enrichedData.company })
      }

    } catch (error) {
      logger.error('Lead enrichment failed', error instanceof Error ? error : new Error('Unknown error'), { leadId })
    }
  }

  private extractCompanyFromEmail(email: string): string | undefined {
    const domain = email.split('@')[1]
    if (!domain) return undefined

    // Remove common prefixes
    const cleanDomain = domain.replace(/^(www\.|mail\.|contact\.)/, '')
                          .replace(/\.(com|org|net|edu|gov)$/, '')
                          .replace(/[.-]/g, ' ')

    return cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1)
  }
}

export class LeadRouter {
  static assignLead(leadData: LeadData): string | null {
    // Simple round-robin assignment + expertise-based
    // In production, get available team members, check capacity, expertise

    // For now, assign to admin user or return null for manual assignment
    // This would typically query team members table
    return null // Manual assignment required
  }

  static isHighQualityLead(score: LeadScore): boolean {
    return score.total_score >= 70 && score.intent_level >= 50
  }
}

export class LeadManager {
  async createLead(incomingLead: IncomingLead): Promise<LeadData> {
    // Calculate initial score
    const score = LeadScorer.calculateScore(incomingLead)

    // Create basic contact info
    const contactInfo: ContactInfo = {
      name: incomingLead.name,
      email: incomingLead.email,
      phone: incomingLead.phone
    }

    // Insert into database
    const { data, error } = await supabase
      .from('leads')
      .insert({
        site_id: incomingLead.site_id,
        name: incomingLead.name,
        email: incomingLead.email,
        phone: incomingLead.phone || null,
        message: incomingLead.message || null,
        source: incomingLead.source,
        status: 'new',
        score_data: score as any,
        contact_info: contactInfo as any,
        tags: []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create lead', error, { lead: incomingLead })
      throw new Error('Failed to create lead')
    }

    // Trigger enrichment if high quality
    if (LeadRouter.isHighQualityLead(score)) {
      // Async enrichment job
      setTimeout(() => {
        const enrichment = new LeadEnrichment()
        enrichment.enrichLead(data.id)
      }, 100)
    }

    const leadData: LeadData = {
      id: data.id,
      contact: contactInfo,
      score,
      tags: [],
      status: 'new',
      assigned_to: null,
      follow_up_date: null,
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    logger.info('Lead created successfully', { leadId: data.id, score: score.total_score })
    return leadData
  }

  async updateLeadStatus(leadId: string, status: 'new' | 'qualified' | 'contacted' | 'converted'): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)

    if (error) {
      logger.error('Failed to update lead status', error, { leadId, status })
      throw new Error('Failed to update lead status')
    }

    logger.info('Lead status updated', { leadId, status })
  }

  async assignLead(leadId: string, assignTo: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .update({
        assigned_to: assignTo,
        follow_up_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours reminder
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)

    if (error) {
      logger.error('Failed to assign lead', error, { leadId, assignTo })
      throw new Error('Failed to assign lead')
    }

    logger.info('Lead assigned successfully', { leadId, assignTo })
  }

  async getLeads(siteId?: string, status?: string): Promise<LeadData[]> {
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (siteId) {
      query = query.eq('site_id', siteId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch leads', error, { siteId, status })
      throw new Error('Failed to fetch leads')
    }

    return data.map(lead => ({
      id: lead.id,
      contact: lead.contact_info as unknown as ContactInfo,
      score: lead.score_data as unknown as LeadScore,
      tags: lead.tags as string[] || [],
      status: lead.status,
      assigned_to: lead.assigned_to,
      follow_up_date: lead.follow_up_date,
      marketing_campaign: lead.marketing_campaign,
      enriched_at: lead.enriched_at,
      created_at: lead.created_at,
      updated_at: lead.updated_at
    }))
  }
}
