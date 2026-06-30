'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payment, membership, member, userRole, auditLog } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { eq, desc, and, gte, lte } from 'drizzle-orm'

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

export async function recordPayment(data: {
  memberId: number
  membershipId?: number
  amount: string
  type: string
  method?: string
  notes?: string
}) {
  const performedBy = await getUserId()
  const isAllowed = await isOwnerOrStaff(performedBy)

  if (!isAllowed) {
    throw new Error('Only owner or staff can record payments')
  }

  const memberData = await db.query.member.findFirst({
    where: eq(member.id, data.memberId),
  })

  if (!memberData) throw new Error('Member not found')

  const newPayment = await db.insert(payment).values({
    memberId: data.memberId,
    membershipId: data.membershipId,
    amount: data.amount,
    type: data.type,
    method: data.method || 'cash',
    status: 'pending',
    processedBy: performedBy,
    notes: data.notes,
    paymentDate: new Date(),
  }).returning()

  await logAudit('PAYMENT_RECORDED', performedBy, memberData.userId, `Payment: ${data.amount} ${data.type}`)

  return newPayment[0]
}

export async function approvePayment(paymentId: number) {
  const performedBy = await getUserId()
  const isOwner = await db.query.userRole.findFirst({
    where: eq(userRole.userId, performedBy),
  })

  if (isOwner?.role !== 'owner') {
    throw new Error('Only owner can approve payments')
  }

  const paymentData = await db.query.payment.findFirst({
    where: eq(payment.id, paymentId),
  })

  if (!paymentData) throw new Error('Payment not found')

  const updated = await db.update(payment)
    .set({ status: 'completed' })
    .where(eq(payment.id, paymentId))
    .returning()

  if (paymentData.membershipId) {
    await db.update(membership)
      .set({ 
        paymentStatus: 'paid',
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(membership.id, paymentData.membershipId))
  }

  const memberData = await db.query.member.findFirst({
    where: eq(member.id, paymentData.memberId),
  })

  await logAudit('PAYMENT_APPROVED', performedBy, memberData?.userId, `Approved payment: ${paymentId}`)

  return updated[0]
}

export async function rejectPayment(paymentId: number, reason?: string) {
  const performedBy = await getUserId()
  const isOwner = await db.query.userRole.findFirst({
    where: eq(userRole.userId, performedBy),
  })

  if (isOwner?.role !== 'owner') {
    throw new Error('Only owner can reject payments')
  }

  const paymentData = await db.query.payment.findFirst({
    where: eq(payment.id, paymentId),
  })

  if (!paymentData) throw new Error('Payment not found')

  const updated = await db.update(payment)
    .set({ 
      status: 'rejected',
      notes: reason || 'Rejected by owner',
    })
    .where(eq(payment.id, paymentId))
    .returning()

  const memberData = await db.query.member.findFirst({
    where: eq(member.id, paymentData.memberId),
  })

  await logAudit('PAYMENT_REJECTED', performedBy, memberData?.userId, `Rejected payment: ${paymentId}`)

  return updated[0]
}

export async function getPaymentsByMember(memberId: number) {
  const userId = await getUserId()
  const memberData = await db.query.member.findFirst({
    where: eq(member.id, memberId),
  })

  if (!memberData) throw new Error('Member not found')

  const isAllowed = await isOwnerOrStaff(userId)
  if (!isAllowed && memberData.userId !== userId) {
    throw new Error('Unauthorized')
  }

  const payments = await db.query.payment.findMany({
    where: eq(payment.memberId, memberId),
    orderBy: desc(payment.paymentDate),
  })

  return payments
}

export async function getPendingPayments() {
  const userId = await getUserId()
  const isOwner = await db.query.userRole.findFirst({
    where: eq(userRole.userId, userId),
  })

  if (isOwner?.role !== 'owner') {
    throw new Error('Only owner can view pending payments')
  }

  const pendingPayments = await db.query.payment.findMany({
    where: eq(payment.status, 'pending'),
    with: {
      member: true,
      membership: true,
    },
    orderBy: desc(payment.paymentDate),
  })

  return pendingPayments
}

export async function getPaymentStats(startDate?: Date, endDate?: Date) {
  const userId = await getUserId()
  const isAllowed = await isOwnerOrStaff(userId)

  if (!isAllowed) {
    throw new Error('Unauthorized')
  }

  const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1))
  const end = endDate || new Date()

  const allPayments = await db.query.payment.findMany()

  const payments = allPayments.filter(p => {
    const pDate = new Date(p.paymentDate)
    return pDate >= start && pDate <= end
  })

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)

  return {
    totalRevenue,
    pendingAmount,
    totalTransactions: payments.length,
    completedTransactions: payments.filter(p => p.status === 'completed').length,
  }
}
