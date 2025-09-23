import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate status parameter
    const validStatuses = ['pending', 'processing', 'completed', 'failed'] as const
    type JobStatus = (typeof validStatuses)[number]
    const validatedStatus: JobStatus | null =
      status && validStatuses.includes(status as JobStatus) ? (status as JobStatus) : null

    let query = supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) {
      query = query.eq('type', type)
    }

    if (validatedStatus) {
      query = query.eq('status', validatedStatus)
    }

    const { data: jobs, error: jobsError, count } = await query

    if (jobsError) {
      console.error('Jobs fetch error:', jobsError)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    return NextResponse.json({
      jobs: jobs || [],
      total: count || 0,
      offset,
      limit,
    })
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { type, data: jobData } = body

    if (!type || !jobData) {
      return NextResponse.json({ error: 'Job type and data are required' }, { status: 400 })
    }

    // Create new job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        type,
        data: jobData,
        status: 'pending',
      })
      .select()
      .single()

    if (jobError) {
      console.error('Job creation error:', jobError)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('Jobs creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
