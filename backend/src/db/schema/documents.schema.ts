import { pgTable, uuid, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentNumber: text('document_number').unique(),
  entityType: text('entity_type').notNull(), // 'WAREHOUSE_RECEIPT' | 'HOUSE_BILL' | 'BILL_OF_LADING' | 'MANIFEST' | 'SHIPMENT'
  entityId: text('entity_id').notNull(),
  documentType: text('document_type').notNull(), // 'LABEL_4X6' | 'HBL_PDF' | 'MBL_PDF' | 'MANIFEST_CSV' | 'MANIFEST_XML' | 'CUSTOMS_DOC'
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url'),
  mimeType: text('mime_type'),
  fileSize: integer('file_size'),
  status: text('status').default('Generated').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type DocumentRecord = typeof documents.$inferSelect;
export type NewDocumentRecord = typeof documents.$inferInsert;
