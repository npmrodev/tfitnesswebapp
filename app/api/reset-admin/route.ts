import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, userRole, member } from '@/lib/db/schema'

export async function POST() {
  try {
    const email = 'admin@tfitness.com'
    const password = 'Admin@123'
    
    // Try to sign up the admin account
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: 'Admin User',
      },
    })
    
    if ((result as any).response?.status === 409) {
      // Account already exists, try to update the password
      return NextResponse.json({ 
        success: false, 
        message: 'Admin account already exists. Please use sign-up page to create a new account.',
        instructions: 'Go to https://tfitnesswebapp.vercel.app/sign-up to create a new account'
      })
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
      password: password
    })
  } catch (error) {
    console.error('[Reset Admin] Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Account creation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      instructions: 'Please go to https://tfitnesswebapp.vercel.app/sign-up to create a new account'
    }, { status: 500 })
  }
}
