'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { membership, member, userRole, auditLog } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { eq, desc } from 'drizzle-orm'
import { calculateMembershipEndDate, getGymSettings } from '@/lib/utils/gym'

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

export async function createMembership(data: {
  memberId: number
  type: string
  price: string
}) {
  const performedBy = await getUserId()
  const isOwnerUser = await isOwner(performedBy)

  if (!isOwnerUser) {
    throw new Error('Only owner can create memberships')
  }

  const memberData = await db.query.member.findFirst({
    where: eq(member.id, data.memberId),
  })

  if (!memberData) throw new Error('Member not found')

  const startDate = new Date()
  const endDate = calculateMembershipEndDate(startDate, data.type)

  const newMembership = await db.insert(membership).values({
    memberId: data.memberId,
    type: data.type,
    price: data.price,
    startDate,
    endDate,
    status: 'pending',
    paymentStatus: 'unpaid',
  }).returning()

  await logAudit('MEMBERSHIP_CREATED', performedBy, memberData.userId, `Created ${data.type} membership`)

  return newMembership[0]
}

export async function getMembershipsForMember(memberId: number) {
  const userId = await getUserId()
  const memberData = await db.query.member.findFirst({
    where: eq(member.id, memberId),
  })

  if (!memberData) throw new Error('Member not found')

  const isOwnerUser = await isOwner(userId)
  if (!isOwnerUser && memberData.userId !== userId) {
    throw new Error('Unauthorized')
  }

  const memberships = await db.query.membership.findMany({
    where: eq(membership.memberId, memberId),
    orderBy: desc(membership.createdAt),
  })

  return memberships
}

export async function updateMembershipStatus(membershipId: number, status: string, paymentStatus?: string) {
  const performedBy = await getUserId()
  const isOwnerUser = await isOwner(performedBy)

  if (!isOwnerUser) {
    throw new Error('Only owner can update memberships')
  }

  const membershipData = await db.query.membership.findFirst({
    where: eq(membership.id, membershipId),
  })

  if (!membershipData) throw new Error('Membership not found')

  const updated = await db.update(membership)
    .set({
      status,
      paymentStatus: paymentStatus || membershipData.paymentStatus,
      updatedAt: new Date(),
    })
    .where(eq(membership.id, membershipId))
    .returning()

  const memberData = await db.query.member.findFirst({
    where: eq(member.id, membershipData.memberId),
  })

  await logAudit('MEMBERSHIP_UPDATED', performedBy, memberData?.userId, `Updated membership status to ${status}`)

  return updated[0]
}

export async function activateMembership(membershipId: number) {
  return updateMembershipStatus(membershipId, 'active', 'paid')
}

export async function getMembershipStats() {
  const userId = await getUserId()
  const isOwnerUser = await isOwner(userId)

  if (!isOwnerUser) {
    throw new Error('Unauthorized')
  }

  const allMemberships = await db.query.membership.findMany()

  const activeMemberships = allMemberships.filter(m => m.status === 'active').length
  const expiredMemberships = allMemberships.filter(m => {
    if (!m.endDate) return false
    return new Date() > m.endDate && m.status === 'active'
  }).length
  const pendingMemberships = allMemberships.filter(m => m.status === 'pending').length

  return {
    activeMemberships,
    expiredMemberships,
    pendingMemberships,
  }
}
