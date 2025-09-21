import { supabase } from './supabase'
import { LeadData, LeadScore, ContactInfo, Database, PaymentGatewayType } from '../types/database'
import { logger } from './logger'
import {
  IncomingLead,
  EnrichedLeadData,
  LeadStatus,
  CommunicationType,
  TeamMember,
  CommunicationLog,
  LeadFilterOptions,
  LeadStats,
  AssignmentRecommendation,
  AssignmentResult
} from '../types/leads'

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
  private static roundRobinIndex = 0

  static async assignLead(leadData: LeadData): Promise<string | null> {
    try {
      // Get available team members
      const availableMembers = await this.getAvailableTeamMembers()

      if (availableMembers.length === 0) {
        logger.warn('No available team members for lead assignment', { leadId: leadData.id })
        return null
      }

      // Apply intelligent routing strategy
      const bestAssignee = await this.findBestAssignee(leadData, availableMembers)

      if (bestAssignee) {
        logger.info('Lead assigned using intelligent routing', {
          leadId: leadData.id,
          assigneeId: bestAssignee.id,
          assigneeName: bestAssignee.name,
          assignmentType: 'intelligent'
        })
        return bestAssignee.id
      }

      // Fallback to round-robin
      const assignee = this.roundRobinAssign(availableMembers)
      logger.info('Lead assigned using round-robin fallback', {
        leadId: leadData.id,
        assigneeId: assignee?.id,
        assigneeName: assignee?.name,
        assignmentType: 'round-robin'
      })
      return assignee?.id || null

    } catch (error) {
      logger.error('Failed to assign lead', error instanceof Error ? error : new Error('Unknown error'), { leadId: leadData.id })
      return null
    }
  }

  static isHighQualityLead(score: LeadScore): boolean {
    return score.total_score >= 70 && score.intent_level >= 50
  }

  // Helper interfaces for team member data
  private static getAvailableTeamMembers(): Promise<Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    capacity: number;
    assigned_leads: number;
    skills: string[];
    location: string;
    timezone: string;
    availability_status: string;
    last_assignment: string;
    performance_score: number;
  }>> {
    return Promise.resolve([
      {
        id: 'team_1',
        email: 'sarah@micrositeforge.com',
        name: 'Sarah Johnson',
        role: 'manager',
        capacity: 15,
        assigned_leads: 8,
        skills: ['marketing', 'sales', 'crm'],
        location: 'New York',
        timezone: 'America/New_York',
        availability_status: 'available',
        last_assignment: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        performance_score: 92
      },
      {
        id: 'team_2',
        email: 'mike@micrositeforge.com',
        name: 'Mike Chen',
        role: 'agent',
        capacity: 12,
        assigned_leads: 5,
        skills: ['digital-marketing', 'social-media', 'strategy'],
        location: 'Los Angeles',
        timezone: 'America/Los_Angeles',
        availability_status: 'available',
        last_assignment: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        performance_score: 87
      },
      {
        id: 'team_3',
        email: 'anna@micrositeforge.com',
        name: 'Anna Petrov',
        role: 'junior',
        capacity: 10,
        assigned_leads: 12, // Overloaded
        skills: ['content-creation', 'design'],
        location: 'London',
        timezone: 'Europe/London',
        availability_status: 'busy',
        last_assignment: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        performance_score: 78
      },
      {
        id: 'team_4',
        email: 'david@micrositeforge.com',
        name: 'David Kumar',
        role: 'agent',
        capacity: 15,
        assigned_leads: 10,
        skills: ['sales', 'consulting', 'business-development'],
        location: 'Singapore',
        timezone: 'Asia/Singapore',
        availability_status: 'available',
        last_assignment: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        performance_score: 89
      },
      {
        id: 'team_5',
        email: 'emily@micrositeforge.com',
        name: 'Emily Rodriguez',
        role: 'admin',
        capacity: 18,
        assigned_leads: 14,
        skills: ['leadership', 'strategy', 'analytics'],
        location: 'Austin',
        timezone: 'America/Chicago',
        availability_status: 'available',
        last_assignment: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        performance_score: 95
      }
    ].filter(member =>
      member.availability_status === 'available' &&
      member.assigned_leads < member.capacity &&
      (member.capacity - member.assigned_leads) > 2 // Leave buffer
    ))
  }

  private static findBestAssignee(leadData: LeadData, availableMembers: Array<any>): any | null {
    // Priority routing strategy based on multiple factors

    // 1. Geography-based routing (highest priority)
    const localMembers = availableMembers.filter(member =>
      this.isSameLocation(leadData.contact.location || 'Unknown', member.location)
    )

    if (localMembers.length > 0) {
      logger.info('Geography-based routing applied', {
        leadId: leadData.id,
        totalLocalMembers: localMembers.length
      })
      return this.selectByCapacity(localMembers)
    }

    // 2. Skill-based routing
    const skilledMembers = availableMembers.filter(member =>
      this.hasRelevantSkills(leadData, member.skills)
    )

    if (skilledMembers.length > 0) {
      logger.info('Skill-based routing applied', {
        leadId: leadData.id,
        skillsMatched: skilledMembers.length
      })
      return this.selectByCapacity(skilledMembers)
    }

    // 3. Lead quality-based routing for high-value leads
    if (this.isHighQualityLead(leadData.score)) {
      const highCapacityMembers = availableMembers.filter(member =>
        member.capacity >= 15 && member.performance_score >= 85
      )

      if (highCapacityMembers.length > 0) {
        logger.info('Quality-based routing applied', {
          leadId: leadData.id,
          leadScore: leadData.score.total_score
        })
        return this.selectByCapacity(highCapacityMembers)
      }
    }

    // 4. Performance-based routing
    const highPerformingMembers = availableMembers.filter(member =>
      member.performance_score >= 85
    )

    if (highPerformingMembers.length > 0) {
      return this.selectByCapacity(highPerformingMembers)
    }

    // 5. Capacity-based routing (lowest available capacity utilization)
    if (availableMembers.length > 0) {
      const lowestUtilizedMember = availableMembers.reduce((prev, current) =>
        (prev.assigned_leads / prev.capacity) < (current.assigned_leads / current.capacity)
          ? prev
          : current
      )
      return lowestUtilizedMember
    }

    return null
  }

  private static selectByCapacity(members: Array<any>): any {
    // Select member with most available capacity
    return members.reduce((prev, current) =>
      (prev.capacity - prev.assigned_leads) > (current.capacity - current.assigned_leads)
        ? prev
        : current
    )
  }

  private static roundRobinAssign(availableMembers: Array<any>): any {
    const assignee = availableMembers[this.roundRobinIndex % availableMembers.length]
    this.roundRobinIndex = (this.roundRobinIndex + 1) % availableMembers.length
    return assignee
  }

  private static isSameLocation(leadLocation: string, memberLocation: string): boolean {
    const locationMappings: Record<string, string[]> = {
      'New York': ['NY', 'New York', 'NYC', 'New_York', 'East_Coast'],
      'Los Angeles': ['LA', 'Los Angeles', 'California', 'West_Coast'],
      'London': ['London', 'UK', 'England', 'Europe'],
      'Singapore': ['Singapore', 'SG', 'Asia', 'Asia_Pacific'],
      'Austin': ['Austin', 'Texas', 'Central_Time']
    }

    const normalizeLocation = (location: string): string => {
      return location.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '')
    }

    const leadNormalized = normalizeLocation(leadLocation)
    const memberNormalized = normalizeLocation(memberLocation)

    for (const [region, locations] of Object.entries(locationMappings)) {
      const normalizedLocations = locations.map(loc => normalizeLocation(loc))
      if (normalizedLocations.includes(leadNormalized) && normalizedLocations.includes(memberNormalized)) {
        return true
      }
    }

    return false
  }

  private static hasRelevantSkills(leadData: LeadData, memberSkills: string[]): boolean {
    const leadContext = `${leadData.contact.company || ''}`.toLowerCase()
    const leadTitle = ''.toLowerCase() // No title available
    const leadIndustry = ''.toLowerCase() // No industry available

    const relevantSkills = memberSkills.map(skill => skill.toLowerCase())

    // Industry-specific matching
    if (leadIndustry.includes('real estate') && relevantSkills.includes('real estate')) return true
    if (leadIndustry.includes('ecommerce') && (relevantSkills.includes('ecommerce') || relevantSkills.includes('sales'))) return true
    if (leadIndustry.includes('marketing') && (relevantSkills.includes('marketing') || relevantSkills.includes('digital-marketing'))) return true

    // Title-specific matching
    if (leadTitle.includes('ceo') && relevantSkills.includes('strategy')) return true
    if (leadTitle.includes('sales') && relevantSkills.includes('sales')) return true
    if (leadTitle.includes('digit') && relevantSkills.includes('digital-marketing')) return true

    // Keyword matching
    const contextKeywords = leadContext.split(' ').filter(word => word.length > 3)
    return contextKeywords.some(keyword =>
      relevantSkills.some(skill => skill.includes(keyword) || keyword.includes(skill))
    )
  }

  static async getAssignmentRecommendations(leadData: LeadData): Promise<Array<any>> {
    try {
      const availableMembers = await this.getAvailableTeamMembers()

      const scoredMembers = availableMembers.map(member => ({
        ...member,
        score: this.calculateAssignmentScore(leadData, member)
      }))

      const recommendations = scoredMembers
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

      logger.info('Generated assignment recommendations', {
        leadId: leadData.id,
        recommendationCount: recommendations.length,
        topScore: recommendations[0]?.score || 0
      })

      return recommendations
    } catch (error) {
      logger.error('Failed to get assignment recommendations', error instanceof Error ? error : new Error('Unknown error'), { leadId: leadData.id })
      return []
    }
  }

  private static calculateAssignmentScore(leadData: LeadData, member: any): number {
    let score = 0

    // Capacity score (25 points max)
    const capacityUtilization = member.assigned_leads / member.capacity
    score += (1 - capacityUtilization) * 25

    // Experience score based on role (20 points max)
    const roleWeights: Record<string, number> = { admin: 20, manager: 15, agent: 10, junior: 5 }
    score += roleWeights[member.role] || 0

    // Geography score (20 points max)
    if (this.isSameLocation(leadData.contact.location || 'Unknown', member.location)) {
      score += 20
    }

    // Skills relevance score (15 points max)
    if (this.hasRelevantSkills(leadData, member.skills)) {
      score += 15
    }

    // Performance score contribution (10 points max)
    score += (member.performance_score / 100) * 10

    // Lead quality bonus (5 points max)
    if (this.isHighQualityLead(leadData.score)) {
      score += 5
    }

    // Freshness bonus - prefer recently active members (5 points max)
    const hoursSinceLastAssignment = (Date.now() - new Date(member.last_assignment).getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastAssignment > 2) {
      score += 5
    }

    return Math.round(score)
  }

  static async updateTeamMemberCapacity(memberId: string, assignedLeadsChange: number): Promise<void> {
    try {
      logger.info('Team member capacity updated', { memberId, change: assignedLeadsChange })

      if (assignedLeadsChange > 0) {
        await this.checkCapacityAlert(memberId)
      }
    } catch (error) {
      logger.error('Failed to update team member capacity', error instanceof Error ? error : new Error('Unknown error'), { memberId })
    }
  }

  private static async checkCapacityAlert(memberId: string): Promise<void> {
    try {
      const mockUtilization = (Math.random() * 0.5) + 0.5 // 50-100% utilization simulation
      if (mockUtilization > 0.9) {
        logger.warn('Team member at risk of overload', { memberId, utilization: Math.round(mockUtilization * 100) })
      }
    } catch (error) {
      logger.error('Failed to check capacity alert', error instanceof Error ? error : new Error('Unknown error'), { memberId })
    }
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

    if (!data) {
      logger.error('No data returned from lead creation', new Error('No data returned'), { lead: incomingLead })
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

  async updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .update({
        status: status as any,
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
