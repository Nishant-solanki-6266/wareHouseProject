import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { shipments } from './shipments.schema';

export const trackingEvents = pgTable('tracking_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  trackingNumber: text('tracking_number').notNull(),
  shipmentId: uuid('shipment_id').references(() => shipments.id, { onDelete: 'cascade' }),
  stage: text('stage').notNull(), // 'Cargo Received' | 'Consolidated' | 'Loaded & Sealed' | 'In Transit' | 'Arrived at Port' | 'Delivered / Released'
  status: text('status').default('Completed').notNull(), // 'Pending' | 'Active' | 'Completed'
  eventDate: text('event_date').notNull(),
  eventTime: text('event_time'),
  location: text('location').notNull(),
  notes: text('notes'),
  checkpointIndex: integer('checkpoint_index').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type NewTrackingEvent = typeof trackingEvents.$inferInsert;
