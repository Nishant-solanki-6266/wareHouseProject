import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const settings = pgTable('settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(), // e.g., 'companyProfile', 'numberingRules', 'labelSettings', 'unitsAndCurrencies'
  value: jsonb('value').$type<Record<string, unknown>>().notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
