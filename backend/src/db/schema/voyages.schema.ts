import { pgTable, uuid, text, integer, numeric, timestamp } from 'drizzle-orm/pg-core';
import { vessels } from './vessels.schema';

export const voyages = pgTable('voyages', {
  id: uuid('id').defaultRandom().primaryKey(),
  voyageNumber: text('voyage_number').notNull().unique(), // e.g. 'V.2026-18W'
  vesselId: uuid('vessel_id').references(() => vessels.id),
  vesselName: text('vessel_name').notNull(),
  carrier: text('carrier'),
  originPort: text('origin_port').notNull(),
  destinationPort: text('destination_port').notNull(),
  departureDate: text('departure_date'),
  arrivalDate: text('arrival_date'),
  status: text('status').default('Scheduled').notNull(),
  assignedShipmentsCount: integer('assigned_shipments_count').default(0).notNull(),
  totalTeuUtilized: numeric('total_teu_utilized', { precision: 6, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Voyage = typeof voyages.$inferSelect;
export type NewVoyage = typeof voyages.$inferInsert;
