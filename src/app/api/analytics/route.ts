import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { AnalyticsEngine, ReportBuilder, ReportScheduler } from '@/lib/analytics'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'dashboard', 'leads', 'revenue', 'sites', 'report'
    const reportId = searchParams.get('reportId')

    const analytics = new AnalyticsEngine()
    const userId = session.user.id

    switch (type) {
      case 'dashboard':
        const dashboardData = await analytics.getDashboardData(userId)
        return NextResponse.json(dashboardData)

      case 'leads':
        const leadData = await analytics.getLeadAnalytics(userId)
        return NextResponse.json(leadData)

      case 'revenue':
        const revenueData = await analytics.getRevenueTracking(userId)
        return NextResponse.json(revenueData)

      case 'sites':
        const siteData = await analytics.getSitePerformance(userId)
        return NextResponse.json(siteData)

      case 'realtime':
        // For real-time metrics - could use websockets in production
        const realtimeData = await analytics.getDashboardData(userId)
        return NextResponse.json({ ...realtimeData, timestamp: new Date().toISOString() })

      default:
        // Default comprehensive dashboard data
        const overview = await analytics.getDashboardData(userId)
        const leadAnalytics = await analytics.getLeadAnalytics(userId)
        const revenueTracking = await analytics.getRevenueTracking(userId)
        const sitePerformance = await analytics.getSitePerformance(userId)

        return NextResponse.json({
          overview,
          leadAnalytics,
          revenueTracking,
          sitePerformance,
        })
    }
  } catch (error) {
    logger.error('Analytics API error', error instanceof Error ? error : new Error('Unknown error'))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'generateReport') {
      const reportData = await ReportBuilder.generateCustomReport(body.report, session.user.id)
      return NextResponse.json(reportData)
    }

    if (action === 'scheduleReport') {
      await ReportScheduler.scheduleReport(body.report, session.user.id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    logger.error('Analytics API POST error', error instanceof Error ? error : new Error('Unknown error'))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
