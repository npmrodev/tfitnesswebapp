'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { auditLog, userRole } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { eq, desc, and, gte, lte } from 'drizzle-orm'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getAuditLogs(limit: number = 100, offset: number = 0) {
  const userId = await getUserId()
  const isOwner = await db.query.userRole.findFirst({
    where: eq(userRole.userId, userId),
  })

  if (isOwner?.role !== 'owner') {
    throw new Error('Only owner can view audit logs')
  }

  const logs = await db.query.auditLog.findMany({
    orderBy: desc(auditLog.createdAt),
    limit,
    offset,
  })

  return logs
}

export async function getAuditLogsForUser(relatedUserId: string, limit: number = 100) {
  const userId = await getUserId()
  const isOwner = await db.query.userRole.findFirst({
    where: eq(userRole.userId, userId),
  })

  if (isOwner?.role !== 'owner') {
    throw new Error('Only owner can view audit logs')
  }

  const logs = await db.query.auditLog.findMany({
    where: eq(auditLog.relatedUserId, relatedUserId),
    orderBy: desc(auditLog.createdAt),
    limit,
  })

  return logs
}

export async function getAuditLogsByAction(action: string, limit: number = 100) {
  const userId = await getUserId()
  const isOwner = await db.query.userRole.findFirst({
    where: eq(userRole.userId, userId),
  })

  if (isOwner?.role !== 'owner') {
    throw new Error('Only owner can view audit logs')
  }

  const logs = await db.query.auditLog.findMany({
    where: eq(auditLog.action, action),
    orderBy: desc(auditLog.createdAt),
    limit,
  })

  return logs
}

export async function getAuditLogsByDateRange(startDate: Date, endDate: Date) {
  const userId = await getUserId()
  const isOwner = await db.query.userRole.findFirst({
    where: eq(userRole.userId, userId),
  })

  if (isOwner?.role !== 'owner') {
    throw new Error('Only owner can view audit logs')
  }

  const logs = await db.query.auditLog.findMany({
    orderBy: desc(auditLog.createdAt),
  })

  return logs.filter(log => {
    const logDate = new Date(log.createdAt)
    return logDate >= startDate && logDate <= endDate
  })
}

export async function getAuditStats() {
  const userId = await getUserId()
  const isOwner = await db.query.userRole.findFirst({
    where: eq(userRole.userId, userId),
  })

  if (isOwner?.role !== 'owner') {
    throw new Error('Only owner can view audit logs')
  }

  const logs = await db.query.auditLog.findMany()

  const actions = {
    logins: logs.filter(l => l.action === 'LOGIN').length,
    logouts: logs.filter(l => l.action === 'LOGOUT').length,
    memberCreated: logs.filter(l => l.action === 'MEMBER_CREATED').length,
    memberUpdated: logs.filter(l => l.action === 'MEMBER_UPDATED').length,
    memberDeleted: logs.filter(l => l.action === 'MEMBER_DELETED').length,
    membershipCreated: logs.filter(l => l.action === 'MEMBERSHIP_CREATED').length,
    paymentRecorded: logs.filter(l => l.action === 'PAYMENT_RECORDED').length,
    paymentApproved: logs.filter(l => l.action === 'PAYMENT_APPROVED').length,
    checkIns: logs.filter(l => l.action === 'CHECK_IN').length,
  }

  return {
    totalActions: logs.length,
    ...actions,
  }
}
