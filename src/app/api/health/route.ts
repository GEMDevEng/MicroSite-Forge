import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Health check endpoint for monitoring system status
type HealthChecks = { [key: string]: unknown }

export async function GET(_request: NextRequest) {
  const startTime = Date.now()
  const status: { status: string; timestamp: string; checks: HealthChecks } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {},
  }

  try {
    // 1. Database connectivity check
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await Promise.race([
      supabase.from('microsites').select('count', { count: 'exact', head: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ])

    status.checks.database = {
      status: 'healthy',
      response_time: Date.now() - startTime,
      message: 'Database connection successful'
    }

    // 2. Environment variables check
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

    if (missingEnvVars.length > 0) {
      status.checks.environment = {
        status: 'warning',
        message: `Missing environment variables: ${missingEnvVars.join(', ')}`
      }
      status.status = 'degraded'
    } else {
      status.checks.environment = {
        status: 'healthy',
        message: 'All required environment variables are set'
      }
    }

    // 3. Memory usage check
    const memUsage = process.memoryUsage()
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    }

    status.checks.memory = {
      status: memUsage.heapUsed > 500 ? 'warning' : 'healthy',
      usage: memUsageMB,
      message: memUsage.heapUsed > 500
        ? 'High memory usage detected'
        : 'Memory usage within normal range'
    }

    // 4. Basic uptime check
    status.checks.uptime = {
      status: 'healthy',
      uptime_seconds: process.uptime(),
      message: 'Service is running'
    }

  } catch (error: unknown) {
    status.status = 'unhealthy'
    status.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      response_time: Date.now() - startTime
    }
  }

  const responseTime = Date.now() - startTime
  status.checks.total_response_time = responseTime

  const httpStatus = status.status === 'healthy' ? 200 :
                   status.status === 'degraded' ? 200 :
                   status.status === 'warning' ? 200 : 503

  return NextResponse.json(status, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      'X-Response-Time': responseTime.toString(),
    }
  })
}

// Health check for HEAD requests (ping)
export async function HEAD(_request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}
