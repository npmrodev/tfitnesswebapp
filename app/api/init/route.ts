import { NextResponse } from 'next/server'
import { setupTestAccounts } from '@/app/actions/setup'
import { db } from '@/lib/db'
import { gymSetting } from '@/lib/db/schema'

export async function POST() {
  try {
    // First, just initialize gym settings
    const existingSettings = await db.query.gymSetting.findFirst()
    if (!existingSettings) {
      await db.insert(gymSetting).values({
        gymName: 'T-FITNESS',
        gymEmail: 'contact@tfitness.com',
        gymPhone: '+1 (555) 123-4567',
        gymAddress: '123 Fitness Street, Gym City, GC 12345',
        monthlyPrice: '50.00',
        quarterlyPrice: '130.00',
        semiAnnualPrice: '240.00',
        annualPrice: '450.00',
        perSessionPrice: '15.00',
        guestPassPrice: '20.00',
        weekPassPrice: '80.00',
        twoWeekPassPrice: '150.00',
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Gym settings initialized. Please create accounts through sign-up page.' 
    })
  } catch (error) {
    console.error('[Init] Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to initialize gym settings' 
  })
}
