import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('Login attempt:', { email })

    const result = await auth.api.signInEmail({
      body: { email, password },
    })

    console.log('Login result:', result)

    if ((result as any).error) {
      return NextResponse.json(
        { error: (result as any).error.message || 'Login failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
