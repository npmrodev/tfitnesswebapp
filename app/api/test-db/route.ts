import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, account, userRole } from '@/lib/db/schema'

export async function GET() {
  try {
    // Test database connection
    const users = await db.query.user.findMany()
    const accounts = await db.query.account.findMany()
    const roles = await db.query.userRole.findMany()

    return NextResponse.json({
      success: true,
      data: {
        users: users.map(u => ({ id: u.id, email: u.email, name: u.name })),
        accounts: accounts.map(a => ({ id: a.id, userId: a.userId, providerId: a.providerId })),
        roles: roles.map(r => ({ userId: r.userId, role: r.role })),
      },
      message: 'Database connection successful'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database connection failed'
    }, { status: 500 })
  }
}
