import { pgTable, uuid, text, numeric, timestamp } from 'drizzle-orm/pg-core';

export const agents = pgTable('agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  agentCode: text('agent_code').notNull().unique(), // e.g., 'AGT-001'
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  territory: text('territory'),
  address: text('address'),
  assignedPortCode: text('assigned_port_code'), // Links to port code e.g. 'NAS'
  status: text('status').default('Active').notNull(),
  rating: text('rating').default('5.0/5'),
  creditLimitUsd: numeric('credit_limit_usd', { precision: 12, scale: 2 }).default('0.00'),
  currentBalanceUsd: numeric('current_balance_usd', { precision: 12, scale: 2 }).default('0.00'),
  lastActivity: text('last_activity'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
