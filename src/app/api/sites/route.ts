import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { createSiteSchema, sitesFilterSchema, type SitesFilters } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Parse and validate filters
    const filters = sitesFilterSchema.parse({
      status: searchParams.get('status'),
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }) as SitesFilters

    // Ensure offset and limit are numbers, never undefined
    const offset = filters.offset ?? 0
    const limit = filters.limit ?? 10

    let query = supabase
      .from('sites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const { data: sites, error: sitesError, count } = await query

    if (sitesError) {
      console.error('Sites fetch error:', sitesError)
      return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 })
    }

    return NextResponse.json({
      sites: sites || [],
      total: count || 0,
      offset: filters.offset,
      limit: filters.limit,
    })
  } catch (error: unknown) {
    console.error('Sites API error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any // ZodError has errors property
      return NextResponse.json(
        { error: 'Invalid request parameters', details: zodError.errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        status: 'pending',
      })
      .select()
      .single()

    if (siteError) {
      console.error('Site creation error:', siteError)
      return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
    }

    return NextResponse.json({ site }, { status: 201 })
  } catch (error: unknown) {
    console.error('Sites creation API error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any // ZodError has errors property
      return NextResponse.json(
        { error: 'Invalid request data', details: zodError.errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
