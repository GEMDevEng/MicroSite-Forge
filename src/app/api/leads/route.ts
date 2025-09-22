import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { LeadManager, IncomingLead } from '@/lib/lead-manager'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('site_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate status parameter
    const validStatuses = ['new', 'contacted', 'qualified', 'converted'] as const
    type LeadStatus = typeof validStatuses[number]
    const validatedStatus = status && validStatuses.includes(status as LeadStatus) ? status as LeadStatus : null

    // Get sites owned by user for validation
    const { data: userSites } = await supabase
      .from('sites')
      .select('id')
      .eq('user_id', user.id)

    const userSiteIds = userSites?.map(site => site.id) || []

    let query = supabase
      .from('leads')
      .select(`
        *,
        sites!inner (
          name,
          user_id
        )
      `)
      .in('site_id', userSiteIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (siteId) {
      if (!userSiteIds.includes(siteId)) {
        return NextResponse.json(
          { error: 'Access denied to this site' },
          { status: 403 }
        )
      }
      query = query.eq('site_id', siteId)
    }

    if (validatedStatus) {
      query = query.eq('status', validatedStatus)
    }

    const { data: leads, error: leadsError, count } = await query

    if (leadsError) {
      console.error('Leads fetch error:', leadsError)
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      leads: leads || [],
      total: count || 0,
      offset,
      limit
    })
  } catch (error) {
    console.error('Leads API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { site_id, name, email, phone, message, source } = body

    // Validate required fields
    if (!site_id || !name || !email) {
      return NextResponse.json(
        { error: 'Site ID, name, and email are required' },
        { status: 400 }
      )
    }

    // Verify user owns the site
    const { data: site, error: siteCheckError }: { data: { id: string; user_id: string } | null, error: Error | null } = await supabase
      .from('sites')
      .select('id, user_id')
      .eq('id', site_id)
      .eq('user_id', user.id)
      .single()

    if (siteCheckError || !site) {
      return NextResponse.json(
        { error: 'Access denied or invalid site' },
        { status: 403 }
      )
    }

    // Create incoming lead object
    const incomingLead: IncomingLead = {
      site_id,
      name,
      email,
      phone,
      message,
      source: source || 'website'
    }

    // Use LeadManager to create lead with automatic scoring
    try {
      const leadManager = new LeadManager()
      const leadData = await leadManager.createLead(incomingLead)

      logger.info('Lead created via API', { leadId: leadData.id, siteId: site_id, userId: user.id })

      return NextResponse.json({ lead: leadData }, { status: 201 })
    } catch (error) {
      logger.error('Failed to create lead via LeadManager', error instanceof Error ? error : new Error('Unknown error'), { siteId: site_id, userId: user.id })

      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Leads creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
