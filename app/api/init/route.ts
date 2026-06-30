import { NextResponse } from 'next/server'
import { setupTestAccounts } from '@/app/actions/setup'

export async function POST() {
  try {
    const result = await setupTestAccounts()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('[Init] Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Initialization failed' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to initialize the application with test accounts' 
  })
}
