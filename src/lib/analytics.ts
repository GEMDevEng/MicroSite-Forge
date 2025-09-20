import { supabase } from './supabase'
import { logger } from './logger'

export interface AnalyticsData {
  overview: {
    totalSites: number
    totalLeads: number
    totalRevenue: number
    conversionRate: number
    activeSites: number
    qualifiedLeads: number
  }
  sitePerformance: {
    site_id: string
    name: string | null
    views: number
    leads_generated: number
    conversion_rate: number
    revenue: number
    bounce_rate: number
    avg_session_duration: number
  }[]
  leadAnalytics: {
    totalLeads: number
    newLeads: number
    qualified: number
    contacted: number
    converted: number
    avgScore: number
    conversionRate: number
    costPerLead: number
    leadSources: Array<{
      source: string
      count: number
      conversionRate: number
    }>
  }
  revenueTracking: {
    monthlyRecurring: number
    oneTimeServices: number
    churnRate: number
    lifetimeValue: number
    monthlyRevenue: Array<{
      month: string
      revenue: number
      leads: number
    }>
  }
  campaignMetrics?: {
    campaignId: string
    campaignName: string
    emailsSent: number
    responses: number
    conversions: number
    roi: number
  }[]
}

export interface CustomReport {
  id: string
  name: string
  filters: {
    dateRange: { start: string, end: string }
    sites?: string[]
    leadStatus?: string[]
    sources?: string[]
  }
  metrics: string[]
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
}

export class AnalyticsEngine {
  async getDashboardData(userId: string): Promise<AnalyticsData['overview']> {
    try {
      // Get total sites
      const { data: sites, error: sitesError } = await supabase
        .from('sites')
        .select('id')
        .eq('user_id', userId)

      // Get total leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, status')
        .eq('user_id', userId)

      // Mock revenue data for now
      const totalRevenue = Math.floor(Math.random() * 10000)

      if (sitesError) logger.error('Failed to fetch sites count', sitesError)
      if (leadsError) logger.error('Failed to fetch leads count', leadsError)

      const totalSites = sites?.length || 0
      const totalLeads = leads?.length || 0
      const qualifiedLeads = leads?.filter(lead => lead.status === 'qualified').length || 0
      const activeSites = totalSites // Assume all sites are active
      const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0

      return {
        totalSites,
        totalLeads,
        totalRevenue,
        conversionRate,
        activeSites,
        qualifiedLeads
      }
    } catch (error) {
      logger.error('Failed to get dashboard data', error instanceof Error ? error : new Error('Unknown error'))
      return {
        totalSites: 0,
        totalLeads: 0,
        totalRevenue: 0,
        conversionRate: 0,
        activeSites: 0,
        qualifiedLeads: 0
      }
    }
  }

  async getLeadAnalytics(userId: string): Promise<AnalyticsData['leadAnalytics']> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('status, score_data, source, created_at')
        .eq('user_id', userId)

      if (error) throw error

      const totalLeads = leads?.length || 0
      const newLeads = leads?.filter(lead => lead.status === 'new').length || 0
      const qualified = leads?.filter(lead => lead.status === 'qualified').length || 0
      const contacted = leads?.filter(lead => lead.status === 'contacted').length || 0
      const converted = leads?.filter(lead => lead.status === 'converted').length || 0

      const scores = leads?.map(lead => (lead.score_data as any)?.total_score).filter(Boolean) as number[]
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0

      // Mock cost per lead
      const costPerLead = 25.50

      // Group by sources
      const sourceMap = new Map<string, number>()
      const sourceConversions = new Map<string, number>()

      leads?.forEach(lead => {
        const source = lead.source || 'unknown'
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1)
        if (lead.status === 'converted') {
          sourceConversions.set(source, (sourceConversions.get(source) || 0) + 1)
        }
      })

      const leadSources = Array.from(sourceMap.entries()).map(([source, count]) => {
        const conversions = sourceConversions.get(source) || 0
        return {
          source,
          count,
          conversionRate: count > 0 ? (conversions / count) * 100 : 0
        }
      })

      return {
        totalLeads,
        newLeads,
        qualified,
        contacted,
        converted,
        avgScore,
        conversionRate,
        costPerLead,
        leadSources
      }
    } catch (error) {
      logger.error('Failed to get lead analytics', error instanceof Error ? error : new Error('Unknown error'))
      return {
        totalLeads: 0,
        newLeads: 0,
        qualified: 0,
        contacted: 0,
        converted: 0,
        avgScore: 0,
        conversionRate: 0,
        costPerLead: 0,
        leadSources: []
      }
    }
  }

  async getRevenueTracking(userId: string): Promise<AnalyticsData['revenueTracking']> {
    try {
      // Mock data for now - in production, query subscription/invoice tables
      const monthlyRecurring = Math.floor(Math.random() * 5000) + 1000
      const oneTimeServices = Math.floor(Math.random() * 2000)
      const churnRate = Math.random() * 10

      // Mock monthly revenue over past 6 months
      const monthlyRevenue = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const month = date.toLocaleString('default', { month: 'short', year: '2-digit' })
        const revenue = Math.floor(Math.random() * 2000) + 500
        const leads = Math.floor(Math.random() * 50) + 10
        monthlyRevenue.push({ month, revenue, leads })
      }

      return {
        monthlyRecurring,
        oneTimeServices,
        churnRate,
        lifetimeValue: 15000, // Mock LTV
        monthlyRevenue
      }
    } catch (error) {
      logger.error('Failed to get revenue tracking', error instanceof Error ? error : new Error('Unknown error'))
      return {
        monthlyRecurring: 0,
        oneTimeServices: 0,
        churnRate: 0,
        lifetimeValue: 0,
        monthlyRevenue: []
      }
    }
  }

  async getSitePerformance(userId: string): Promise<AnalyticsData['sitePerformance']> {
    try {
      const { data: sites, error } = await supabase
        .from('sites')
        .select('id, name, domain')
        .eq('user_id', userId)

      if (error) throw error

      // Mock performance data for each site
      const sitePerformance = sites?.map(site => ({
        site_id: site.id,
        name: site.name || site.domain,
        views: Math.floor(Math.random() * 10000) + 1000,
        leads_generated: Math.floor(Math.random() * 100) + 10,
        conversion_rate: Math.random() * 10,
        revenue: Math.floor(Math.random() * 5000),
        bounce_rate: Math.random() * 50,
        avg_session_duration: Math.floor(Math.random() * 300) + 60
      })) || []

      return sitePerformance
    } catch (error) {
      logger.error('Failed to get site performance', error instanceof Error ? error : new Error('Unknown error'))
      return []
    }
  }
}

export class ReportBuilder {
  static async generateCustomReport(report: CustomReport, userId: string): Promise<any> {
    try {
      // This would build a custom report based on filters and metrics
      logger.info('Generating custom report', { reportId: report.id, userId })

      const analytics = new AnalyticsEngine()

      const data: any = {}

      if (report.metrics.includes('dashboard')) {
        data.overview = await analytics.getDashboardData(userId)
      }

      if (report.metrics.includes('leads')) {
        data.leadAnalytics = await analytics.getLeadAnalytics(userId)
      }

      if (report.metrics.includes('revenue')) {
        data.revenueTracking = await analytics.getRevenueTracking(userId)
      }

      if (report.metrics.includes('sites')) {
        data.sitePerformance = await analytics.getSitePerformance(userId)
      }

      return data
    } catch (error) {
      logger.error('Failed to generate custom report', error instanceof Error ? error : new Error('Unknown error'))
      throw error
    }
  }
}

export class ReportScheduler {
  static async scheduleReport(report: CustomReport, userId: string): Promise<void> {
    try {
      // This would set up cron jobs or scheduled tasks
      logger.info('Scheduling report', { reportId: report.id, frequency: report.schedule?.frequency })

      // Implementation would involve scheduling the ReportBuilder.generateCustomReport
      // and sending via email or storing the report

    } catch (error) {
      logger.error('Failed to schedule report', error instanceof Error ? error : new Error('Unknown error'))
      throw error
    }
  }
}
