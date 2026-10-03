import { z } from 'zod';

export const voyageQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
});

export const createVoyageSchema = z.object({
  voyageNumber: z.string().min(1, 'Voyage number is required'),
  vesselId: z.string().uuid().optional().nullable(),
  vesselName: z.string().min(1, 'Vessel name is required'),
  carrier: z.string().optional().nullable(),
  originPort: z.string().min(1, 'Origin port is required'),
  destinationPort: z.string().min(1, 'Destination port is required'),
  departureDate: z.string().optional().nullable(),
  arrivalDate: z.string().optional().nullable(),
  status: z.string().default('Scheduled'),
  assignedShipmentsCount: z.coerce.number().optional().default(0),
  totalTeuUtilized: z.union([z.string(), z.number()]).optional().default('0.00'),
});

export const updateVoyageSchema = createVoyageSchema.partial();

