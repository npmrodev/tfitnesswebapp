'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { member, userRole, auditLog } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { eq, desc } from 'drizzle-orm'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

async function isOwner(userId: string) {
  const role = await db.query.userRole.findFirst({
    where: eq(userRole.userId, userId),
  })
  return role?.role === 'owner'
}

async function logAudit(action: string, performedBy: string, relatedUserId?: string, details?: string) {
  await db.insert(auditLog).values({
    action,
    performedBy,
    relatedUserId,
    details,
  })
}

export async function getMembers() {
  const userId = await getUserId()
  const isOwnerUser = await isOwner(userId)
  if (!isOwnerUser) {
    const role = await db.query.userRole.findFirst({
      where: eq(userRole.userId, userId),
    })
    if (role?.role !== 'staff' && role?.role !== 'owner') {
      throw new Error('Unauthorized')
    }
  }

  const members = await db.query.member.findMany({
    with: {
      memberships: true,
    },
  })

  return members
}

export async function getMemberById(memberId: number) {
  const userId = await getUserId()
  const isOwnerUser = await isOwner(userId)
  
  const memberData = await db.query.member.findFirst({
    where: eq(member.id, memberId),
    with: {
      memberships: true,
      checkIns: true,
      payments: true,
    },
  })

  if (!memberData) throw new Error('Member not found')

  if (!isOwnerUser && memberData.userId !== userId) {
    throw new Error('Unauthorized')
  }

  return memberData
}

export async function createMember(data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  userId: string
}) {
  const performedBy = await getUserId()
  const isOwnerUser = await isOwner(performedBy)
  
  if (!isOwnerUser) {
    throw new Error('Only owner can create members')
  }

  const newMember = await db.insert(member).values({
    userId: data.userId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    status: 'active',
  }).returning()

  await logAudit('MEMBER_CREATED', performedBy, data.userId, `Created member: ${data.firstName} ${data.lastName}`)

  return newMember[0]
}

export async function updateMember(memberId: number, data: {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  status?: string
}) {
  const performedBy = await getUserId()
  const isOwnerUser = await isOwner(performedBy)
  
  const memberData = await db.query.member.findFirst({
    where: eq(member.id, memberId),
  })

  if (!memberData) throw new Error('Member not found')

  if (!isOwnerUser && memberData.userId !== performedBy) {
    throw new Error('Unauthorized')
  }

  const updated = await db.update(member)
    .set({
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(member.id, memberId))
    .returning()

  await logAudit('MEMBER_UPDATED', performedBy, memberData.userId, `Updated member: ${memberId}`)

  return updated[0]
}

export async function deleteMember(memberId: number) {
  const performedBy = await getUserId()
  const isOwnerUser = await isOwner(performedBy)

  if (!isOwnerUser) {
    throw new Error('Only owner can delete members')
  }

  const memberData = await db.query.member.findFirst({
    where: eq(member.id, memberId),
  })

  if (!memberData) throw new Error('Member not found')

  await db.update(member)
    .set({ status: 'deleted', updatedAt: new Date() })
    .where(eq(member.id, memberId))

  await logAudit('MEMBER_DELETED', performedBy, memberData.userId, `Deleted member: ${memberId}`)
}

export async function getMemberStats() {
  const userId = await getUserId()
  const isOwnerUser = await isOwner(userId)

  if (!isOwnerUser) {
    throw new Error('Unauthorized')
  }

  const members = await db.query.member.findMany({
    with: {
      memberships: true,
    },
  })

  const totalMembers = members.length
  const activeMembers = members.filter(m => m.status === 'active').length
  const expiredMembers = members.filter(m => {
    const hasExpired = m.memberships.some(ms => {
      if (!ms.endDate) return false
      return new Date() > ms.endDate
    })
    return hasExpired
  }).length

  return {
    totalMembers,
    activeMembers,
    expiredMembers,
  }
}
