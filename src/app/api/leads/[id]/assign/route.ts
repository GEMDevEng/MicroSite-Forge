import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/middleware'
import { LeadManager } from '@/lib/lead-manager'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: leadId } = await params
    const { assignTo } = await request.json()

    if (!assignTo || typeof assignTo !== 'string') {
      return NextResponse.json(
        { error: 'Assignee ID is required' },
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

    // Create lead manager and assign
    const leadManager = new LeadManager()
    await leadManager.assignLead(leadId, assignTo)

    logger.info('Lead assigned successfully', { leadId, assigneeId: assignTo, userId: session.user.id })

    return NextResponse.json({
      success: true,
      message: 'Lead assigned successfully'
    })

  } catch (error) {
    logger.error('Lead assignment API error', error instanceof Error ? error : new Error('Unknown error'), { leadId })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id: leadId } = await params

  try {

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

    // Unassign lead
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        assigned_to: null,
        follow_up_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)

    if (updateError) {
      logger.error('Failed to unassign lead', updateError, { leadId })
      throw new Error('Failed to unassign lead')
    }

    logger.info('Lead unassigned successfully', { leadId, userId: session.user.id })

    return NextResponse.json({
      success: true,
      message: 'Lead unassigned successfully'
    })

  } catch (error) {
    logger.error('Lead unassignment API error', error instanceof Error ? error : new Error('Unknown error'), { leadId })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
