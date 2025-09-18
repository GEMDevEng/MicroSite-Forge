import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { createSiteSchema, sitesFilterSchema } from '@/lib/validations'

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

    // Parse and validate filters
    const filters = sitesFilterSchema.parse({
      status: searchParams.get('status'),
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    })

    let query = supabase
      .from('sites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(filters.offset!, filters.offset! + filters.limit! - 1)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const { data: sites, error: sitesError, count } = await query

    if (sitesError) {
      console.error('Sites fetch error:', sitesError)
      return NextResponse.json(
        { error: 'Failed to fetch sites' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sites: sites || [],
      total: count || 0,
      offset: filters.offset,
      limit: filters.limit
    })
  } catch (error: any) {
    console.error('Sites API error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }
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

    // Validate input data
    const validatedData = createSiteSchema.parse(body)

    // Create new site
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        domain: validatedData.domain || null,
        status: 'pending'
      })
      .select()
      .single()

    if (siteError) {
      console.error('Site creation error:', siteError)
      return NextResponse.json(
        { error: 'Failed to create site' },
        { status: 500 }
      )
    }

    return NextResponse.json({ site }, { status: 201 })
  } catch (error: any) {
    console.error('Sites creation API error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
