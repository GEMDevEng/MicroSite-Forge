import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const siteId = params.id

    // Get site and verify ownership
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single()

    if (siteError) {
      console.error('Site fetch error:', siteError)

      if (siteError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Site not found' }, { status: 404 })
      }

      return NextResponse.json({ error: 'Failed to fetch site' }, { status: 500 })
    }

    return NextResponse.json({ site })
  } catch (error) {
    console.error('Site GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const siteId = params.id
    const body = await request.json()
    const { name, domain, status, github_repo, netlify_url } = body

    // First verify ownership
    const { data: existingSite, error: checkError } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingSite) {
      return NextResponse.json({ error: 'Site not found or access denied' }, { status: 404 })
    }

    // Update site
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .update({
        name,
        domain,
        status,
        github_repo,
        netlify_url,
      })
      .eq('id', siteId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (siteError) {
      console.error('Site update error:', siteError)
      return NextResponse.json({ error: 'Failed to update site' }, { status: 500 })
    }

    return NextResponse.json({ site })
  } catch (error) {
    console.error('Site PUT API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const siteId = params.id

    // First verify ownership
    const { data: existingSite, error: checkError } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingSite) {
      return NextResponse.json({ error: 'Site not found or access denied' }, { status: 404 })
    }

    // Delete site (this will cascade to leads due to FK constraints)
    const { error: siteError } = await supabase
      .from('sites')
      .delete()
      .eq('id', siteId)
      .eq('user_id', user.id)

    if (siteError) {
      console.error('Site deletion error:', siteError)
      return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Site DELETE API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
