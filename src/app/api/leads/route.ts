import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

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

    if (status) {
      query = query.eq('status', status)
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
    const { data: site, error: siteCheckError } = await supabase
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

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        site_id,
        name,
        email,
        phone,
        message,
        source: source || 'website'
      })
      .select()
      .single()

    if (leadError) {
      console.error('Lead creation error:', leadError)
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    console.error('Leads creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
