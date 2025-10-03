import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-api'

// Comprehensive monitoring dashboard endpoint
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '24h'

    // Calculate time range
    const now = new Date()
    const startTime = new Date()

    switch (timeRange) {
      case '1h':
        startTime.setHours(now.getHours() - 1)
        break
      case '24h':
        startTime.setHours(now.getHours() - 24)
        break
      case '7d':
        startTime.setDate(now.getDate() - 7)
        break
      case '30d':
        startTime.setDate(now.getDate() - 30)
        break
      default:
        startTime.setHours(now.getHours() - 24)
    }

    // 1. System Performance Metrics
    const systemMetrics = {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    }

    // 2. Database Health & Performance
    const { data: dbStats, error: dbError } = await supabase.rpc('get_database_stats')

    // 3. User Activity Metrics
    const { data: userStats } = await supabase
      .from('profiles')
      .select('created_at, last_sign_in_at')
      .gte('created_at', startTime.toISOString())

    // 4. Microsite Performance
    const { data: micrositeStats } = await supabase
      .from('microsites')
      .select(`
        id,
        created_at,
        status,
        performance_score,
        visits_count,
        leads_generated,
        campaigns (status, performance_metrics)
      `)
      .gte('created_at', startTime.toISOString())

    // 5. API Usage Statistics
    const { data: apiLogs } = await supabase
      .from('api_logs')
      .select('method, endpoint, response_time, status_code, created_at')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000)

    // Calculate API metrics
    const apiMetrics = {
      totalRequests: apiLogs?.length || 0,
      avgResponseTime: apiLogs?.length ? apiLogs.reduce((sum, log) => sum + (log.response_time || 0), 0) / apiLogs.length : 0,
      errorRate: apiLogs?.length ? (apiLogs.filter(log => log.status_code >= 400).length / apiLogs.length) * 100 : 0,
      topEndpoints: apiLogs?.reduce((acc: any, log) => {
        acc[log.endpoint] = (acc[log.endpoint] || 0) + 1
        return acc
      }, {}) || {}
    }

    // 6. Error Tracking
    const { data: errorLogs } = await supabase
      .from('error_logs')
      .select('error_type, error_message, stack_trace, created_at, user_id')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    // 7. Campaign Performance
    const { data: campaignStats } = await supabase
      .from('campaigns')
      .select(`
        id,
        status,
        performance_metrics,
        created_at,
        microsites (visits_count, leads_generated)
      `)
      .gte('created_at', startTime.toISOString())

    // 8. Billing/Revenue Metrics
    const { data: billingStats } = await supabase
      .from('subscriptions')
      .select('status, plan_type, created_at, current_period_end')
      .gte('created_at', startTime.toISOString())

    // Aggregate dashboard data
    const dashboard = {
      timestamp: new Date().toISOString(),
      timeRange,
      system: {
        ...systemMetrics,
        memoryMB: {
          rss: Math.round(systemMetrics.memory.rss / 1024 / 1024),
          heapTotal: Math.round(systemMetrics.memory.heapTotal / 1024 / 1024),
          heapUsed: Math.round(systemMetrics.memory.heapUsed / 1024 / 1024)
        }
      },
      database: {
        status: dbError ? 'error' : 'healthy',
        stats: dbStats || {},
        error: dbError?.message
      },
      users: {
        newUsers: userStats?.length || 0,
        activeUsers: userStats?.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > startTime).length || 0,
        totalUsers: userStats?.length || 0
      },
      microsites: {
        total: micrositeStats?.length || 0,
        active: micrositeStats?.filter(m => m.status === 'active').length || 0,
        avgPerformance: micrositeStats?.length ? micrositeStats.reduce((sum, m) => sum + (m.performance_score || 0), 0) / micrositeStats.length : 0,
        totalVisits: micrositeStats?.reduce((sum, m) => sum + (m.visits_count || 0), 0) || 0,
        totalLeads: micrositeStats?.reduce((sum, m) => sum + (m.leads_generated || 0), 0) || 0
      },
  api: apiMetrics,
      errors: {
        total: errorLogs?.length || 0,
        byType: errorLogs?.reduce((acc: Record<string, number>, log) => {
          const key = String(log.error_type || 'unknown')
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {}) || {},
        recent: errorLogs?.slice(0, 10) || []
      },
      campaigns: {
        total: campaignStats?.length || 0,
        active: campaignStats?.filter(c => c.status === 'active').length || 0,
        completed: campaignStats?.filter(c => c.status === 'completed').length || 0
      },
      billing: {
        totalSubscriptions: billingStats?.length || 0,
        activeSubscriptions: billingStats?.filter(s => s.status === 'active').length || 0,
        planDistribution: billingStats?.reduce((acc: Record<string, number>, sub) => {
          const key = String(sub.plan_type || 'unknown')
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {}) || {}
      }
    }

    return NextResponse.json(dashboard)

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Monitoring dashboard error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data', details: message },
      { status: 500 }
    )
  }
}
