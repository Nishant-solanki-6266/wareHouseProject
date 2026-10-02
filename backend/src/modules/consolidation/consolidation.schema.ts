import { z } from 'zod';

export const createConsolidationSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  destinationPort: z.string().min(2, 'Destination port is required'),
  destinationCode: z.string().min(2, 'Destination code is required'),
  status: z.string().optional().default('Loaded'),
  containerNumber: z.string().optional(),
  containerType: z.string().optional(),
  containerCapacityCbm: z.coerce.number().optional().default(67.7),
  sealNumber: z.string().optional(),
  vesselName: z.string().optional(),
  voyageNumber: z.string().optional(),
  carrier: z.string().optional(),
  loadingPort: z.string().optional().default('Port of Miami (USMIA)'),
  dischargePort: z.string().optional(),
  houseBillIds: z.array(z.string()).optional().default([]),
  receiptIds: z.array(z.string()).optional().default([]),
  totalPackages: z.coerce.number().optional().default(0),
  totalPieces: z.coerce.number().optional().default(0),
  totalWeightLbs: z.coerce.number().optional().default(0),
  totalWeightKg: z.coerce.number().optional().default(0),
  totalCft: z.coerce.number().optional().default(0),
  totalCbm: z.coerce.number().optional().default(0),
  containerFillPercentage: z.coerce.number().optional().default(0),
  agentId: z.string().optional(),
  agentName: z.string().optional(),
  etd: z.string().optional(),
  eta: z.string().optional(),
  notes: z.string().optional(),
});

export const consolidationQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  destinationCode: z.string().optional(),
});

