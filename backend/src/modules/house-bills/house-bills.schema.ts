import { z } from 'zod';

export const createHouseBillSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerName: z.string().min(2),
  shipper: z.object({
    name: z.string().min(2),
    address: z.string().min(2),
    contact: z.string().optional(),
    taxId: z.string().optional(),
  }),
  consignee: z.object({
    name: z.string().min(2),
    address: z.string().min(2),
    taxId: z.string().optional(),
    contact: z.string().optional(),
  }),
  notifyParty: z
    .object({
      name: z.string(),
      address: z.string(),
      contact: z.string().optional(),
    })
    .optional(),
  agentId: z.string().uuid().optional(),
  agentName: z.string().optional(),
  originPort: z.string().optional().default('Port of Miami (USMIA), FL'),
  destinationPort: z.string().min(2),
  destinationCode: z.string().min(2),
  warehouseReceiptIds: z.array(z.string()).min(1, 'At least one Warehouse Receipt must be linked'),
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

export const houseBillQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  destinationCode: z.string().optional(),
  customerId: z.string().optional(),
});
