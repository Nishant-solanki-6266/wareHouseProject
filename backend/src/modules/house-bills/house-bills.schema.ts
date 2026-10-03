import { z } from 'zod';

export const contactObjectSchema = z.union([
  z.string().transform(name => ({ name, address: 'Miami, FL' })),
  z.object({
    name: z.string().min(1),
    address: z.string().optional().default('Miami, FL'),
    contact: z.string().optional(),
    taxId: z.string().optional(),
  }),
]);

export const createHouseBillSchema = z.object({
  customerId: z
    .string()
    .optional()
    .nullable()
    .transform(val => (val && val.includes('-') && val.length === 36 ? val : undefined)),
  customerName: z.string().min(2),
  shipper: contactObjectSchema,
  consignee: contactObjectSchema,
  notifyParty: contactObjectSchema.optional(),
  agentId: z
    .string()
    .optional()
    .nullable()
    .transform(val => (val && val.includes('-') && val.length === 36 ? val : undefined)),
  agentName: z.string().optional(),
  originPort: z.string().optional().default('Port of Miami (USMIA), FL'),
  destinationPort: z.string().min(2),
  destinationCode: z.string().min(2),
  warehouseReceiptIds: z.array(z.string()).optional().default([]),
  cargoDescription: z.string().optional(),
  packages: z.array(z.unknown()).optional().default([]),
  totalPackages: z.coerce.number().optional().default(0),
  totalPieces: z.coerce.number().optional().default(0),
  totalWeightLbs: z.coerce.number().optional().default(0),
  totalWeightKg: z.coerce.number().optional().default(0),
  totalCft: z.coerce.number().optional().default(0),
  totalCbm: z.coerce.number().optional().default(0),
  freightTerms: z.string().optional().default('Freight Prepaid'),
  notes: z.string().optional(),
});

export const updateHouseBillSchema = createHouseBillSchema.partial().extend({
  status: z.string().optional(),
  assignedConsolidationId: z.string().optional(),
  assignedMasterBLId: z.string().optional(),
  assignedShipmentId: z.string().optional(),
});

export const houseBillHoldSchema = z.object({
  reason: z.string().min(2, 'Hold reason is required'),
  holdNotes: z.string().optional(),
  holdCategory: z.string().optional().default('Documentation Hold'),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
});


export const houseBillQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  destinationCode: z.string().optional(),
  customerId: z.string().optional(),
});
