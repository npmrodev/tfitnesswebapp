import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, userRole, member, account } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST() {
  try {
    const email = 'admin@tfitness.com'
    const password = 'Admin@123'
    
    // Check if user exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    })
    
    if (existingUser) {
      // Delete existing user and related data
      await db.delete(userRole).where(eq(userRole.userId, existingUser.id))
      await db.delete(member).where(eq(member.userId, existingUser.id))
      await db.delete(account).where(eq(account.userId, existingUser.id))
      await db.delete(user).where(eq(user.id, existingUser.id))
    }
    
    // Create new admin account
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: 'Admin User',
      },
    })
    
    if ((result as any).error) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create admin account',
        error: (result as any).error?.message || 'Unknown error'
      }, { status: 500 })
    }
    
    // Set the role to owner
    if ((result as any).data?.user) {
      await db.insert(userRole).values({
        userId: (result as any).data.user.id,
        role: 'owner',
      })
      
      await db.insert(member).values({
        userId: (result as any).data.user.id,
        firstName: 'Admin',
        lastName: 'User',
        email: email,
        status: 'active',
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin account created successfully',
      email: email,
      password: password,
      instructions: 'You can now log in at https://tfitnesswebapp.vercel.app/sign-in'
    })
  } catch (error) {
    console.error('[Reset Admin] Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Account creation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
