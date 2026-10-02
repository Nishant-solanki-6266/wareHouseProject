import { z } from 'zod';

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
