import { pgTable, uuid, text, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';

export const containers = pgTable('containers', {
  id: uuid('id').defaultRandom().primaryKey(),
  containerNumber: text('container_number').notNull().unique(), // e.g., 'MSKU-948291-4'
  type: text('type').notNull(), // "40' High Cube (HC)", "20' Standard GP", etc.
  carrier: text('carrier'),
  sealNumber: text('seal_number'),
  tareWeightKg: numeric('tare_weight_kg', { precision: 10, scale: 2 }),
  maxPayloadKg: numeric('max_payload_kg', { precision: 10, scale: 2 }),
  maxVolumeCbm: numeric('max_volume_cbm', { precision: 10, scale: 2 }),
  loadedWeightKg: numeric('loaded_weight_kg', { precision: 10, scale: 2 }).default('0.00'),
  loadedVolumeCbm: numeric('loaded_volume_cbm', { precision: 10, scale: 2 }).default('0.00'),
  fillPercentage: numeric('fill_percentage', { precision: 5, scale: 2 }).default('0.00'),
  currentShipmentId: text('current_shipment_id'),
  currentShipmentNumber: text('current_shipment_number'),
  status: text('status').default('Available at CFS Yard').notNull(),
  location: text('location'),
  originPort: text('origin_port'),
  dischargePort: text('discharge_port'),
  temperatureControlled: boolean('temperature_controlled').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Container = typeof containers.$inferSelect;
export type NewContainer = typeof containers.$inferInsert;
