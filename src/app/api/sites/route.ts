import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { createSiteSchema, sitesFilterSchema, type SitesFilters } from '@/lib/validations'
import { withErrorHandler, AuthenticationError } from '@/lib/error-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new AuthenticationError()
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
    throw new Error(`Failed to fetch sites: ${sitesError.message}`)
  }

  return NextResponse.json({
    success: true,
    data: {
      sites: sites || [],
      total: count || 0,
      offset: filters.offset,
      limit: filters.limit,
    },
  })
}, 'sites-get')

export const POST = withErrorHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new AuthenticationError()
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
    throw new Error(`Failed to create site: ${siteError.message}`)
  }

  return NextResponse.json({
    success: true,
    data: { site },
  }, { status: 201 })
}, 'sites-post')
