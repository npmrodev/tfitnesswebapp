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
    const accounts = [
      {
        email: 'admin@tfitness.com',
        password: 'Password123',
        name: 'Admin User',
        role: 'owner',
        firstName: 'Admin',
        lastName: 'User',
      },
      {
        email: 'staff@tfitness.com',
        password: 'Password123',
        name: 'Staff User',
        role: 'staff',
        firstName: 'Staff',
        lastName: 'User',
      },
      {
        email: 'member@tfitness.com',
        password: 'Password123',
        name: 'Member User',
        role: 'member',
        firstName: 'Member',
        lastName: 'User',
      },
    ]

    for (const accountInfo of accounts) {
      const account = (await auth.api.signUpEmail({
        body: {
          email: accountInfo.email,
          password: accountInfo.password,
          name: accountInfo.name,
        },
      })) as any

      if (account.response?.status === 409 || account.response?.status === 400) {
        continue
      }

      if (account.data?.user) {
        await db.insert(userRole).values({
          userId: account.data.user.id,
          role: accountInfo.role,
        })

        await db.insert(member).values({
          userId: account.data.user.id,
          firstName: accountInfo.firstName,
          lastName: accountInfo.lastName,
          email: accountInfo.email,
          status: 'active',
        })
      }
    }

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

    return { success: true, message: 'Test accounts created successfully' }
  } catch (error) {
    console.error('[Setup] Error creating test accounts:', error)
    return { success: false, message: 'Failed to create test accounts' }
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
