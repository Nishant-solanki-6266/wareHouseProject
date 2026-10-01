import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const vessels = pgTable('vessels', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  imoNumber: text('imo_number').notNull().unique(), // e.g. '9482019'
  flag: text('flag'),
  type: text('type'),
  carrier: text('carrier'),
  capacityTeu: integer('capacity_teu'),
  deadweightTonnage: integer('deadweight_tonnage'),
  builtYear: integer('built_year'),
  status: text('status').default('Scheduled').notNull(),
  currentVoyage: text('current_voyage'),
  activeRoute: text('active_route'),
  etaNextPort: text('eta_next_port'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Vessel = typeof vessels.$inferSelect;
export type NewVessel = typeof vessels.$inferInsert;
