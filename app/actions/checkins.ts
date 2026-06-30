'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { checkIn, member, userRole, auditLog } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { eq, desc, gte, lte } from 'drizzle-orm'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

async function isOwnerOrStaff(userId: string) {
  const role = await db.query.userRole.findFirst({
    where: eq(userRole.userId, userId),
  })
  return role?.role === 'owner' || role?.role === 'staff'
}

async function logAudit(action: string, performedBy: string, relatedUserId?: string, details?: string) {
  await db.insert(auditLog).values({
    action,
    performedBy,
    relatedUserId,
    details,
  })
}

export async function checkInMember(memberId: number, method: string = 'qr', notes?: string) {
  const performedBy = await getUserId()
  const isAllowed = await isOwnerOrStaff(performedBy)

  if (!isAllowed) {
    throw new Error('Only owner or staff can perform check-in')
  }

  const memberData = await db.query.member.findFirst({
    where: eq(member.id, memberId),
  })

  if (!memberData) throw new Error('Member not found')

  const newCheckIn = await db.insert(checkIn).values({
    memberId,
    method,
    notes,
    checkInTime: new Date(),
  }).returning()

  await logAudit('CHECK_IN', performedBy, memberData.userId, `Check-in via ${method}`)

  return newCheckIn[0]
}

export async function getCheckInsByMember(memberId: number, limit: number = 50) {
  const userId = await getUserId()
  const memberData = await db.query.member.findFirst({
    where: eq(member.id, memberId),
  })

  if (!memberData) throw new Error('Member not found')

  const isOwnerUser = await isOwnerOrStaff(userId)
  if (!isOwnerUser && memberData.userId !== userId) {
    throw new Error('Unauthorized')
  }

  const checkIns = await db.query.checkIn.findMany({
    where: eq(checkIn.memberId, memberId),
    orderBy: desc(checkIn.checkInTime),
    limit,
  })

  return checkIns
}

export async function getTodayCheckIns() {
  const userId = await getUserId()
  const isAllowed = await isOwnerOrStaff(userId)

  if (!isAllowed) {
    throw new Error('Unauthorized')
  }

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const todayCheckIns = await db.query.checkIn.findMany({
    where: {
      checkInTime: {
        from: startOfDay,
        to: endOfDay,
      },
    },
    with: {
      member: true,
    },
    orderBy: desc(checkIn.checkInTime),
  })

  return todayCheckIns
}

export async function getCheckInStats(startDate?: Date, endDate?: Date) {
  const userId = await getUserId()
  const isAllowed = await isOwnerOrStaff(userId)

  if (!isAllowed) {
    throw new Error('Unauthorized')
  }

  const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30))
  const end = endDate || new Date()

  const checkIns = await db.query.checkIn.findMany({
    where: {
      checkInTime: {
        from: start,
        to: end,
      },
    },
  })

  const totalCheckIns = checkIns.length
  const todayCheckIns = checkIns.filter(ci => {
    const ciDate = new Date(ci.checkInTime)
    const today = new Date()
    return ciDate.toDateString() === today.toDateString()
  }).length

  return {
    totalCheckIns,
    todayCheckIns,
  }
}
