import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Simple validation for beta signup
const BetaSignupSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validated = BetaSignupSchema.parse(body)

    // TODO: Save to database or send to mailing list
    // For MVP, just log and return success
    console.log('Beta signup:', validated.email)

    // In production, this would save to Supabase or other storage
    // For now, just acknowledge the signup

    return NextResponse.json({
      success: true,
      message: 'Thank you for joining our beta program!',
      email: validated.email,
    })
  } catch (error) {
    console.error('Beta signup API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
