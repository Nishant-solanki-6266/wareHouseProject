import { z } from 'zod';

export const createConsolidationSchema = z.object({
  id: z.string().optional(),
  consolidationNumber: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  destinationPort: z.string().min(1, 'Destination port is required'),
  destinationCode: z.string().optional().default('NAS'),
  createdDate: z.string().optional(),
  status: z.string().optional().default('Planning'),
  containerId: z.string().nullish().transform(v => (v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) ? v : undefined),
  containerNumber: z.string().nullish().default(''),
  containerType: z.string().nullish().default('40ft High Cube Standard'),
  containerCapacityCbm: z.coerce.number().nullish().default(67.7),
  sealNumber: z.string().nullish().default(''),
  vesselId: z.string().nullish().transform(v => (v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) ? v : undefined),
  vesselName: z.string().nullish().default('Tropic Carib'),
  voyageId: z.string().nullish().transform(v => (v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) ? v : undefined),
  voyageNumber: z.string().nullish().default('TC-2026-081'),
  carrier: z.string().nullish().default('Tropical Shipping'),
  loadingPort: z.string().optional().default('Port of Miami (USMIA)'),
  dischargePort: z.string().optional().default('Nassau Container Port (NAS)'),
  totalHouseBills: z.coerce.number().optional().default(0),
  houseBillIds: z.array(z.string()).optional().default([]),
  totalReceipts: z.coerce.number().optional().default(0),
  receiptIds: z.array(z.string()).optional().default([]),
  totalPackages: z.coerce.number().optional().default(0),
  totalPieces: z.coerce.number().optional().default(0),
  totalWeightLbs: z.coerce.number().nullish().default(0),
  totalWeightKg: z.coerce.number().nullish().default(0),
  totalCft: z.coerce.number().nullish().default(0),
  totalCbm: z.coerce.number().nullish().default(0),
  containerFillPercentage: z.coerce.number().nullish().default(0),
  assignedShipmentId: z.string().nullish(),
  assignedMasterBLId: z.string().nullish(),
  agentId: z.string().nullish(),
  agentName: z.string().nullish(),
  etd: z.string().nullish(),
  eta: z.string().nullish(),
  notes: z.string().nullish().default(''),
});

export const updateConsolidationSchema = createConsolidationSchema.partial();

export const consolidationQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  destinationCode: z.string().optional(),
});

export const createConsolidationSchema = z.object({
  consolidationNumber: z.string().optional(),
  title: z.string().optional(),
  destinationPort: z.string().default('NAS - Nassau Container Port'),
  destinationCode: z.string().default('NAS'),
  createdDate: z.string().optional(),
  status: z.string().optional().default('Planning'),

  containerId: z.string().nullish(),
  containerNumber: z.string().optional(),
  containerType: z.string().optional().default("40' Standard Dry"),
  containerCapacityCbm: z.coerce.number().optional(),
  sealNumber: z.string().optional(),

  vesselId: z.string().nullish(),
  vesselName: z.string().optional(),
  voyageId: z.string().nullish(),
  voyageNumber: z.string().optional(),
  carrier: z.string().optional().default('Tropical Shipping Line'),

  loadingPort: z.string().optional().default('Port of Miami (USMIA)'),
  dischargePort: z.string().optional(),

  totalHouseBills: z.coerce.number().optional().default(0),
  houseBillIds: z.array(z.string()).optional().default([]),

  totalReceipts: z.coerce.number().optional().default(0),
  receiptIds: z.array(z.string()).optional().default([]),

  totalPackages: z.coerce.number().optional().default(0),
  totalPieces: z.coerce.number().optional().default(0),
  totalWeightLbs: z.coerce.number().optional().default(0),
  totalWeightKg: z.coerce.number().optional().default(0),
  totalCft: z.coerce.number().optional().default(0),
  totalCbm: z.coerce.number().optional().default(0),
  containerFillPercentage: z.coerce.number().optional().default(0),

  assignedShipmentId: z.string().optional(),
  assignedMasterBLId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateConsolidationSchema = createConsolidationSchema.partial();
