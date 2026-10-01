import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const ports = pgTable('ports', {
  id: uuid('id').defaultRandom().primaryKey(),
  portCode: text('port_code').notNull().unique(), // e.g., 'NAS', 'KIN', 'BGI', 'POS', 'MIA'
  name: text('name').notNull(),
  island: text('island'),
  country: text('country').notNull(),
  status: text('status').default('Active').notNull(),
  defaultAgent: text('default_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Port = typeof ports.$inferSelect;
export type NewPort = typeof ports.$inferInsert;
