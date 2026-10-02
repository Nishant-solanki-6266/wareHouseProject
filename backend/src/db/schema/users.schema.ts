import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { agents } from './agents.schema.js';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  userCode: text('user_code').unique(), // e.g., 'USR-001'
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  roleKey: text('role_key').notNull(), // 'super_admin' | 'operations' | 'documentation' | 'agent'
  department: text('department'),
  status: text('status').default('Active').notNull(),
  avatar: text('avatar'),
  lastLogin: text('last_login'),
  phone: text('phone'),
  agentId: uuid('agent_id').references(() => agents.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
