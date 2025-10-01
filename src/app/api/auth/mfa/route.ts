import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // List MFA factors
    const { data, error } = await supabase.auth.mfa.listFactors()

    if (error) {
      console.error('MFA list error:', error)
      return NextResponse.json({ error: 'Failed to list MFA factors' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('MFA API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, factorId, code } = body

    switch (action) {
      case 'enroll': {
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: body.friendlyName || 'Authenticator App',
        })

        if (error) {
          console.error('MFA enroll error:', error)
          return NextResponse.json({ error: 'Failed to enroll MFA factor' }, { status: 500 })
        }

        return NextResponse.json({ data })
      }

      case 'verify': {
        if (!factorId || !code) {
          return NextResponse.json({ error: 'factorId and code are required' }, { status: 400 })
        }

        const challenge = body.challengeId || body.challenge?.id
        if (!challenge) {
          return NextResponse.json({ error: 'challenge is required' }, { status: 400 })
        }

        const { error } = await supabase.auth.mfa.verify({
          factorId,
          code,
          challengeId: challenge,
        })

        if (error) {
          console.error('MFA verify error:', error)
          return NextResponse.json({ error: 'Invalid MFA code' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
      }

      case 'challengeAndVerify': {
        if (!factorId || !code) {
          return NextResponse.json({ error: 'factorId and code are required' }, { status: 400 })
        }

        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code,
        })

        if (error) {
          console.error('MFA challenge and verify error:', error)
          return NextResponse.json({ error: 'Invalid MFA code' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
      }

      case 'unenroll': {
        if (!factorId) {
          return NextResponse.json({ error: 'factorId is required' }, { status: 400 })
        }

        const { error } = await supabase.auth.mfa.unenroll({
          factorId,
        })

        if (error) {
          console.error('MFA unenroll error:', error)
          return NextResponse.json({ error: 'Failed to unenroll MFA factor' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('MFA API POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(_request.url)
    const factorId = url.searchParams.get('factorId')

    if (!factorId) {
      return NextResponse.json({ error: 'factorId is required' }, { status: 400 })
    }

    const { error } = await supabase.auth.mfa.unenroll({
      factorId,
    })

    if (error) {
      console.error('MFA unenroll error:', error)
      return NextResponse.json({ error: 'Failed to unenroll MFA factor' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('MFA API DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
