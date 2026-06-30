'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, userRole, member, gymSetting } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function setupTestAccounts() {
  try {
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

    return { success: true, message: 'Gym settings initialized successfully' }
  } catch (error) {
    console.error('[Setup] Error initializing gym settings:', error)
    return { success: false, message: 'Failed to initialize gym settings' }
  }
}

export async function ensureUserRole(userId: string) {
  try {
    const existingRole = await db.query.userRole.findFirst({
      where: eq(userRole.userId, userId),
    })

    if (!existingRole) {
      await db.insert(userRole).values({
        userId,
        role: 'member',
      })
    }

    return existingRole?.role || 'member'
  } catch (error) {
    console.error('[Setup] Error ensuring user role:', error)
    return 'member'
  }
}
