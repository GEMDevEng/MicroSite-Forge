import { getSupabaseClient } from './supabase'
import { logger } from './logger'

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  contact_info?: Record<string, any>
  score_data?: Record<string, any>
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent?: string
  variables: string[]
  category: 'welcome' | 'nurture' | 'sales' | 'followup' | 'newsletter'
}

export interface SMSTemplate {
  id: string
  name: string
  content: string
  variables: string[]
  category: 'appointment' | 'reminder' | 'confirmation' | 'marketing'
}

export interface EmailCampaign {
  id: string
  name: string
  description?: string
  segment: CampaignSegmentation
  emailTemplate: EmailTemplate
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed'
  schedule: CampaignSchedule
  metrics: EmailCampaignMetrics
  created_at: string
  updated_at: string
}

export interface SMSCampaign {
  id: string
  name: string
  segment: CampaignSegmentation
  smsTemplate: SMSTemplate
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed'
  schedule: CampaignSchedule
  metrics: SMSCampaignMetrics
  created_at: string
  updated_at: string
}

export interface CampaignSegmentation {
  tags?: string[]
  status?: ('new' | 'qualified' | 'contacted' | 'converted')[]
  score?: { min?: number; max?: number }
  source?: string[]
  location?: string
  daysSinceContact?: number
  daysSinceSignup?: number
}

export interface CampaignSchedule {
  sendTime?: string // "09:00"
  sendDate?: string
  timezone?: string
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly'
  sequence?: Array<{
    delayHours: number
    templateId: string
  }>
}

export interface EmailCampaignMetrics {
  totalSent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  replied: number
  converted: number
  openRate: number
  clickRate: number
  bounceRate: number
  conversionRate: number
}

export interface SMSCampaignMetrics {
  totalSent: number
  delivered: number
  failed: number
  replied: number
  clicked: number
  conversionRate: number
}

export class EmailSender {
  private apiKey: string
  private fromEmail: string
  private fromName: string

  constructor(apiKey?: string, fromEmail?: string, fromName?: string) {
    this.apiKey = apiKey || process.env.EMAIL_API_KEY || ''
    this.fromEmail = fromEmail || process.env.FROM_EMAIL || 'noreply@micrositeforge.com'
    this.fromName = fromName || process.env.FROM_NAME || 'MicroSite Forge'
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    variables?: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Replace variables in content
      let processedHtml = htmlContent
      let processedSubject = subject
      let processedText = textContent

      if (variables) {
        Object.entries(variables).forEach(([key, value]) => {
          const regex = new RegExp(`\\$\\{${key}\\}`, 'g')
          processedHtml = processedHtml.replace(regex, String(value))
          processedSubject = processedSubject.replace(regex, String(value))
          if (processedText) {
            processedText = processedText.replace(regex, String(value))
          }
        })
      }

      // Mock implementation - replace with actual email service (SendGrid, AWS SES, etc.)
      logger.info('Sending email', { to, subject: processedSubject })

      // Simulate API call
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: this.fromEmail, name: this.fromName },
          subject: processedSubject,
          content: [
            { type: 'text/plain', value: processedText || processedHtml.replace(/<[^>]*>/g, '') },
            { type: 'text/html', value: processedHtml },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`)
      }

      return { success: true, messageId: response.headers.get('X-Message-Id') || 'unknown' }
    } catch (error) {
      logger.error(
        'Failed to send email',
        error instanceof Error ? error : new Error('Unknown error'),
        { to }
      )
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export class SMSSender {
  private apiKey: string
  private fromNumber: string

  constructor(apiKey?: string, fromNumber?: string) {
    this.apiKey = apiKey || process.env.TWILIO_API_KEY || ''
    this.fromNumber = fromNumber || process.env.TWILIO_PHONE_NUMBER || ''
  }

  async sendSMS(
    to: string,
    message: string,
    variables?: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      let processedMessage = message

      if (variables) {
        Object.entries(variables).forEach(([key, value]) => {
          const regex = new RegExp(`\\$\\{${key}\\}`, 'g')
          processedMessage = processedMessage.replace(regex, String(value))
        })
      }

      logger.info('Sending SMS', { to, messageLength: processedMessage.length })

      // Mock Twilio implementation
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${btoa(`${process.env.TWILIO_SID}:${this.apiKey}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: to,
            From: this.fromNumber,
            Body: processedMessage,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`SMS service error: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, messageId: data.sid }
    } catch (error) {
      logger.error(
        'Failed to send SMS',
        error instanceof Error ? error : new Error('Unknown error'),
        { to }
      )
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export class CommunicationManager {
  private emailSender: EmailSender
  private smsSender: SMSSender

  constructor() {
    this.emailSender = new EmailSender()
    this.smsSender = new SMSSender()
  }

  private isContactInfoWithCompany(obj: any): obj is { company?: string } {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
  }

  private isScoreDataWithTotalScore(obj: any): obj is { total_score?: number } {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
  }

  private getSafeCompany(contactInfo: any): string {
    if (this.isContactInfoWithCompany(contactInfo) && contactInfo.company) {
      return contactInfo.company
    }
    return 'your company'
  }

  private getSafeTotalScore(scoreData: any): number {
    if (this.isScoreDataWithTotalScore(scoreData) && scoreData.total_score) {
      return scoreData.total_score
    }
    return 0
  }

  async sendLeadWelcomeEmail(leadId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        logger.warn('Supabase not configured for communication', { leadId })
        return false
      }

      const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (error || !lead) {
        logger.error('Lead not found for welcome email', error, { leadId })
        return false
      }

      // Use default welcome template (will be stored in database later)
      const contactInfo = lead.contact_info

      let company = 'your company'
      if (this.isContactInfoWithCompany(contactInfo) && contactInfo.company) {
        company = contactInfo.company
      }

      const variables = {
        firstName: lead.name.split(' ')[0],
        company,
      }

      const subject = `Welcome to MicroSite Forge, ${variables.firstName}!`
      const htmlContent = `
        <p>Hello ${variables.firstName}!</p>
        <p>Thank you for your interest in MicroSite Forge. I'm excited to help you create amazing microsites for ${variables.company}.</p>
        <p>You can expect to hear from me soon with more information about how we can work together.</p>
        <p>Best regards,<br />The MicroSite Forge Team</p>
      `

      const result = await this.emailSender.sendEmail(
        lead.email,
        subject,
        htmlContent,
        undefined,
        variables
      )

      if (result.success) {
        // await this.logCommunication(leadId, 'email', 'outbound', htmlContent, 'sent', result.messageId)
        await this.updateLeadStatus(leadId, 'contacted')
      }

      return result.success
    } catch (error) {
      logger.error(
        'Failed to send welcome email',
        error instanceof Error ? error : new Error('Unknown error'),
        { leadId }
      )
      return false
    }
  }

  async sendFollowUpSMS(leadId: string, message?: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        logger.warn('Supabase not configured for communication', { leadId })
        return false
      }

      const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (error || !lead) {
        logger.error('Lead not found for SMS follow-up', error, { leadId })
        return false
      }

      if (!lead.phone) {
        logger.warn('No phone number for SMS', { leadId })
        return false
      }

      const smsMessage =
        message ||
        `Hi ${lead.name.split(' ')[0]}! Following up on your recent inquiry. How can we help you today?`

      const result = await this.smsSender.sendSMS(lead.phone, smsMessage)

      if (result.success) {
        await this.logCommunication(leadId, 'sms', 'outbound', smsMessage, 'sent', result.messageId)
        await this.updateLeadStatus(leadId, 'contacted')
      }

      return result.success
    } catch (error) {
      logger.error(
        'Failed to send follow-up SMS',
        error instanceof Error ? error : new Error('Unknown error'),
        { leadId }
      )
      return false
    }
  }

  private async logCommunication(
    leadId: string,
    type: 'email' | 'sms' | 'call' | 'note',
    direction: 'inbound' | 'outbound',
    content: string,
    status: string,
    messageId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        logger.warn('Supabase not configured for logging communication', { leadId })
        return
      }

      const { error } = await supabase.from('communications').insert({
        lead_id: leadId,
        type,
        direction,
        content,
        status: status as 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked',
        message_id: messageId,
        metadata: metadata || null,
      })

      if (error) {
        logger.error('Failed to log communication to database', error, { leadId, type })
      } else {
        logger.info('Communication logged to database', { leadId, type, direction, status })
      }
    } catch (error) {
      logger.error(
        'Failed to log communication',
        error instanceof Error ? error : new Error('Unknown error'),
        { leadId, type }
      )
    }
  }

  private async updateLeadStatus(
    leadId: string,
    status: 'new' | 'qualified' | 'contacted' | 'converted'
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        logger.warn('Supabase not configured for updating lead status', { leadId, status })
        return
      }

      await supabase
        .from('leads')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
    } catch (error) {
      logger.error(
        'Failed to update lead status',
        error instanceof Error ? error : new Error('Unknown error'),
        { leadId, status }
      )
    }
  }

  // Campaign execution methods
  async executeEmailCampaign(campaign: EmailCampaign): Promise<void> {
    try {
      logger.info('Executing email campaign', { campaignId: campaign.id, name: campaign.name })

      // Get leads matching segmentation
      const leads = await this.getLeadsForCampaign(campaign.segment)

      // Send emails to each lead
      const promises = leads.map(async (lead: Lead) => {
        const variables = {
          firstName: lead.name.split(' ')[0],
          company: this.getSafeCompany(lead.contact_info),
          score: this.getSafeTotalScore(lead.score_data),
        }

        const result = await this.emailSender.sendEmail(
          lead.email,
          campaign.emailTemplate.subject,
          campaign.emailTemplate.htmlContent,
          campaign.emailTemplate.textContent,
          variables
        )

        if (result.success) {
          await this.logCommunication(
            lead.id,
            'email',
            'outbound',
            campaign.emailTemplate.htmlContent,
            'sent',
            result.messageId
          )

          // Update campaign metrics
          await this.incrementCampaignMetrics(campaign.id, 'email')
        }
      })

      await Promise.all(promises)

      logger.info('Email campaign executed successfully', {
        campaignId: campaign.id,
        leadsCount: leads.length,
      })
    } catch (error) {
      logger.error(
        'Failed to execute email campaign',
        error instanceof Error ? error : new Error('Unknown error'),
        { campaignId: campaign.id }
      )
      throw error
    }
  }

  async executeSMSCampaign(campaign: SMSCampaign): Promise<void> {
    try {
      logger.info('Executing SMS campaign', { campaignId: campaign.id, name: campaign.name })

      // Get leads matching segmentation
      const leads = await this.getLeadsForCampaign(campaign.segment)

      // Send SMS to each lead with phone number
      const promises = leads
        .filter((lead: Lead) => lead.phone)
        .map(async (lead: Lead) => {
          const variables = {
            firstName: lead.name.split(' ')[0],
            company: this.getSafeCompany(lead.contact_info),
          }

          const result = await this.smsSender.sendSMS(
            lead.phone!,
            campaign.smsTemplate.content,
            variables
          )

          if (result.success) {
            await this.logCommunication(
              lead.id,
              'sms',
              'outbound',
              campaign.smsTemplate.content,
              'sent',
              result.messageId
            )

            // Update campaign metrics
            await this.incrementCampaignMetrics(campaign.id, 'sms')
          }
        })

      await Promise.all(promises)

      logger.info('SMS campaign executed successfully', {
        campaignId: campaign.id,
        leadsCount: leads.filter((l) => l.phone).length,
      })
    } catch (error) {
      logger.error(
        'Failed to execute SMS campaign',
        error instanceof Error ? error : new Error('Unknown error'),
        { campaignId: campaign.id }
      )
      throw error
    }
  }

  private async getLeadsForCampaign(segment: CampaignSegmentation): Promise<Lead[]> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase not configured for campaign lead fetching')
    }

    let query = supabase.from('leads').select('*')

    if (segment.tags?.length) {
      query = query.overlaps('tags', segment.tags)
    }

    if (segment.status?.length) {
      query = query.in('status', segment.status)
    }

    if (segment.score) {
      if (segment.score.min !== undefined) {
        query = query.gte('score_data -> total_score', segment.score.min)
      }
      if (segment.score.max !== undefined) {
        query = query.lte('score_data -> total_score', segment.score.max)
      }
    }

    if (segment.source?.length) {
      query = query.in('source', segment.source)
    }

    const { data, error } = await query.limit(1000) // Limit for campaign performance

    if (error) {
      throw new Error(`Failed to fetch leads for campaign: ${error.message}`)
    }

    return data || []
  }

  private async incrementCampaignMetrics(campaignId: string, type: 'email' | 'sms'): Promise<void> {
    try {
      // Update campaign metrics (this would be stored in a separate campaigns table)
      // For now, we'll just log it
      logger.info(`Campaign metric updated: ${type} sent for campaign ${campaignId}`)
    } catch (error) {
      logger.error(
        'Failed to update campaign metrics',
        error instanceof Error ? error : new Error('Unknown error'),
        { campaignId }
      )
    }
  }
}
