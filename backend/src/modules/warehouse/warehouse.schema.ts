import { z } from 'zod';

export const packageItemSchema = z.object({
  id: z.string().optional(),
  packageType: z.string().default('Carton'),
  description: z.string().default('General Cargo'),
  lengthInches: z.coerce.number().min(0).default(0),
  widthInches: z.coerce.number().min(0).default(0),
  heightInches: z.coerce.number().min(0).default(0),
  weightLbs: z.coerce.number().min(0).default(0),
  pieces: z.coerce.number().min(1).default(1),
  cft: z.coerce.number().optional().default(0),
  cbm: z.coerce.number().optional().default(0),
});

export const createWarehouseReceiptSchema = z.object({
  date: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().min(2, 'Customer name is required'),
  shipper: z.string().optional(),
  consignee: z.string().optional(),
  agentId: z.string().optional(),
  agentName: z.string().optional(),
  destinationPort: z.string().min(2, 'Destination port is required'),
  destinationCode: z.string().min(2, 'Destination port code is required'),
  cargoDescription: z.string().optional(),
  packages: z.array(packageItemSchema).optional().default([]),
  packageType: z.string().optional(),
  lengthInches: z.coerce.number().optional(),
  widthInches: z.coerce.number().optional(),
  heightInches: z.coerce.number().optional(),
  weightLbs: z.coerce.number().optional(),
  warehouseLocation: z.string().optional(),
  status: z.string().optional(),
  hazardous: z.boolean().optional().default(false),
  fragile: z.boolean().optional().default(false),
  notes: z.string().optional(),
});

export const updateWarehouseReceiptSchema = createWarehouseReceiptSchema.partial().extend({
  assignedHouseBillId: z.string().optional(),
  assignedConsolidationId: z.string().optional(),
  assignedShipmentId: z.string().optional(),
});

export const warehouseReceiptQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  destinationCode: z.string().optional(),
  customerId: z.string().optional(),
  agentId: z.string().optional(),
});
