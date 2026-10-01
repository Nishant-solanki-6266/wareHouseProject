import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  logNumber: text('log_number').notNull().unique(), // e.g. "AUD-9912"
  timestamp: text('timestamp').notNull(),
  userId: uuid('user_id').references(() => users.id),
  userName: text('user_name').notNull(),
  userRole: text('user_role'),
  module: text('module').notNull(), // 'Warehouse Receipt' | 'House Bill' | 'Bill of Lading' | 'Consolidation' | 'Shipping Manifest' | 'Agent Portal' | 'System'
  action: text('action').notNull(),
  recordId: text('record_id'),
  description: text('description').notNull(),
  ipAddress: text('ip_address'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
