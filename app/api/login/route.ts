import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, userRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('Simple login attempt:', { email })

    // Simple hardcoded credentials check for admin and staff
    const validCredentials = {
      'admin@tfitness.com': 'Admin@123',
      'staff@tfitness.com': 'Staff@123',
    }

    if (validCredentials[email as keyof typeof validCredentials] !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Find or create user in database
    let userRecord = await db.query.user.findFirst({
      where: eq(user.email, email),
    })

    if (!userRecord) {
      // Create user if doesn't exist
      const userId = crypto.randomUUID()
      const [newUser] = await db.insert(user).values({
        id: userId,
        email,
        name: email === 'admin@tfitness.com' ? 'Admin User' : 'Staff User',
      }).returning()
      userRecord = newUser

      // Set role
      await db.insert(userRole).values({
        userId: userId,
        role: email === 'admin@tfitness.com' ? 'owner' : 'staff',
      })
    }

    // Set simple session cookie
    const cookieStore = await cookies()
    cookieStore.set('session', userRecord.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log('Simple login successful:', { userId: userRecord.id, email })

    return NextResponse.json({ 
      success: true, 
      userId: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
    })
  } catch (error) {
    console.error('Simple login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
