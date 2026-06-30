import { pgTable, text, timestamp, boolean, serial, integer, decimal, date } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id),
  token: text('token').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// Gym Management Tables
export const userRole = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull().unique().references(() => user.id),
  role: text('role').notNull().default('member'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const member = pgTable('members', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull().unique().references(() => user.id),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  dateOfBirth: date('dateOfBirth'),
  joinDate: timestamp('joinDate').notNull().defaultNow(),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const membership = pgTable('memberships', {
  id: serial('id').primaryKey(),
  memberId: integer('memberId').notNull().references(() => member.id),
  type: text('type').notNull(),
  status: text('status').notNull().default('pending'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate'),
  paymentStatus: text('paymentStatus').notNull().default('unpaid'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const checkIn = pgTable('check_ins', {
  id: serial('id').primaryKey(),
  memberId: integer('memberId').notNull().references(() => member.id),
  checkInTime: timestamp('checkInTime').notNull().defaultNow(),
  method: text('method').notNull().default('qr'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const payment = pgTable('payments', {
  id: serial('id').primaryKey(),
  memberId: integer('memberId').notNull().references(() => member.id),
  membershipId: integer('membershipId').references(() => membership.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: text('type').notNull(),
  status: text('status').notNull().default('pending'),
  method: text('method').notNull().default('cash'),
  processedBy: text('processedBy').notNull(),
  notes: text('notes'),
  paymentDate: timestamp('paymentDate').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const gymSetting = pgTable('gym_settings', {
  id: serial('id').primaryKey(),
  gymName: text('gymName').notNull().default('T-FITNESS'),
  gymEmail: text('gymEmail'),
  gymPhone: text('gymPhone'),
  gymAddress: text('gymAddress'),
  monthlyPrice: decimal('monthlyPrice', { precision: 10, scale: 2 }).default('50.00'),
  quarterlyPrice: decimal('quarterlyPrice', { precision: 10, scale: 2 }).default('130.00'),
  semiAnnualPrice: decimal('semiAnnualPrice', { precision: 10, scale: 2 }).default('240.00'),
  annualPrice: decimal('annualPrice', { precision: 10, scale: 2 }).default('450.00'),
  perSessionPrice: decimal('perSessionPrice', { precision: 10, scale: 2 }).default('15.00'),
  guestPassPrice: decimal('guestPassPrice', { precision: 10, scale: 2 }).default('20.00'),
  weekPassPrice: decimal('weekPassPrice', { precision: 10, scale: 2 }).default('80.00'),
  twoWeekPassPrice: decimal('twoWeekPassPrice', { precision: 10, scale: 2 }).default('150.00'),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const auditLog = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  action: text('action').notNull(),
  performedBy: text('performedBy').notNull(),
  relatedUserId: text('relatedUserId'),
  details: text('details'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Relations
export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  role: one(userRole, { fields: [user.id], references: [userRole.userId] }),
  member: one(member, { fields: [user.id], references: [member.userId] }),
}))

export const memberRelations = relations(member, ({ many, one }) => ({
  user: one(user, { fields: [member.userId], references: [user.id] }),
  memberships: many(membership),
  checkIns: many(checkIn),
  payments: many(payment),
}))

export const membershipRelations = relations(membership, ({ many, one }) => ({
  member: one(member, { fields: [membership.memberId], references: [member.id] }),
  payments: many(payment),
}))

export const checkInRelations = relations(checkIn, ({ one }) => ({
  member: one(member, { fields: [checkIn.memberId], references: [member.id] }),
}))

export const paymentRelations = relations(payment, ({ one }) => ({
  member: one(member, { fields: [payment.memberId], references: [member.id] }),
  membership: one(membership, { fields: [payment.membershipId], references: [membership.id] }),
}))
