import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/middleware'
import { LeadEnrichment } from '@/lib/lead-manager'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json()

    if (!leadId || typeof leadId !== 'string') {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    // Auth check
    const { supabase, session } = await createMiddlewareClient(request)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the lead (via site)
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('sites!inner(*)')
      .eq('id', leadId)
      .eq('sites.user_id', session.user.id)
      .single()

    if (leadError || !lead) {
      logger.warn('Lead not found or not owned by user', { leadId, userId: session.user.id })
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Trigger enrichment
    const enrichment = new LeadEnrichment()
    await enrichment.enrichLead(leadId)

    logger.info('Lead enrichment triggered successfully', { leadId, userId: session.user.id })

    return NextResponse.json({
      success: true,
      message: 'Lead enrichment started'
    })

  } catch (error) {
    logger.error('Lead enrichment API error', error instanceof Error ? error : new Error('Unknown error'), {})
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
