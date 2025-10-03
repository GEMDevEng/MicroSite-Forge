import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Automated alerting and incident response endpoint
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { type, severity, message, details, metric, threshold, currentValue } = body

    // Create alert record
    const { data: alert, error } = await supabase
      .from('alerts')
      .insert({
        type,
        severity: severity || 'warning',
        message,
        details,
        metric,
        threshold,
        current_value: currentValue,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Trigger appropriate response based on alert type and severity
    await triggerAlertResponse(alert)

    // If critical severity, create incident
    if (severity === 'critical') {
      await createIncident(alert)
    }

    return NextResponse.json({ alert, triggered: true })

  } catch (error: any) {
    console.error('Alert creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert', details: error.message },
      { status: 500 }
    )
  }
}

// Get active alerts
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const severity = searchParams.get('severity')

    let query = supabase
      .from('alerts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (severity) {
      query = query.eq('severity', severity)
    }

    const { data: alerts, error } = await query.limit(50)

    if (error) throw error

    return NextResponse.json({ alerts })

  } catch (error: any) {
    console.error('Alerts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts', details: error.message },
      { status: 500 }
    )
  }
}

// Update alert status (acknowledge/resolve)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { id, status, acknowledged_by, resolved_at } = body

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'acknowledged' && acknowledged_by) {
      updateData.acknowledged_by = acknowledged_by
      updateData.acknowledged_at = new Date().toISOString()
    }

    if (status === 'resolved') {
      updateData.resolved_at = resolved_at || new Date().toISOString()
    }

    const { data: alert, error } = await supabase
      .from('alerts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ alert })

  } catch (error: any) {
    console.error('Alert update error:', error)
    return NextResponse.json(
      { error: 'Failed to update alert', details: error.message },
      { status: 500 }
    )
  }
}

async function triggerAlertResponse(alert: any) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Log alert response
  await supabase
    .from('alert_responses')
    .insert({
      alert_id: alert.id,
      response_type: 'automated',
      action_taken: `Alert triggered: ${alert.type} - ${alert.severity}`,
      timestamp: new Date().toISOString()
    })

  // Different response strategies based on alert type
  switch (alert.type) {
    case 'database_performance':
      // Scale database or trigger optimization
      await handleDatabaseAlert(alert)
      break

    case 'api_error_rate':
      // Notify team, potentially throttle requests
      await handleAPIAlert(alert)
      break

    case 'memory_usage':
      // Check for memory leaks, potentially restart service
      await handleMemoryAlert(alert)
      break

    case 'response_time':
      // Performance issue, may need optimization
      await handlePerformanceAlert(alert)
      break

    default:
      // Generic alert handling
      await handleGenericAlert(alert)
  }
}

async function createIncident(alert: any) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: incident, error } = await supabase
    .from('incidents')
    .insert({
      title: `Critical Alert: ${alert.type}`,
      description: alert.message,
      severity: 'critical',
      status: 'investigating',
      alert_id: alert.id,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create incident:', error)
    return
  }

  // Trigger incident response protocol
  await triggerIncidentResponse(incident)
}

async function triggerIncidentResponse(incident: any) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Log incident creation
  await supabase
    .from('incident_responses')
    .insert({
      incident_id: incident.id,
      response_type: 'incident_created',
      action_taken: 'Critical incident declared, initiating response protocol',
      timestamp: new Date().toISOString()
    })

  // Here you would typically:
  // 1. Notify on-call engineer via Slack/webhook
  // 2. Create PagerDuty incident
  // 3. Start incident bridge call
  // 4. Escalate to management if needed

  console.log(`🚨 CRITICAL INCIDENT: ${incident.title}`)
  console.log(`Description: ${incident.description}`)
  console.log(`Incident ID: ${incident.id}`)
}

// Specific alert handlers
async function handleDatabaseAlert(alert: any) {
  console.log('Database performance alert triggered:', alert)
  // Implement database-specific response logic
}

async function handleAPIAlert(alert: any) {
  console.log('API error rate alert triggered:', alert)
  // Implement API-specific response logic
}

async function handleMemoryAlert(alert: any) {
  console.log('Memory usage alert triggered:', alert)
  // Implement memory-specific response logic
}

async function handlePerformanceAlert(alert: any) {
  console.log('Performance alert triggered:', alert)
  // Implement performance-specific response logic
}

async function handleGenericAlert(alert: any) {
  console.log('Generic alert triggered:', alert)
  // Implement generic response logic
}
