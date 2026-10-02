import { z } from 'zod';

export const containerQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
});

export const createContainerSchema = z.object({
  containerNumber: z.string().min(3, 'Container number is required'),
  type: z.string().default("40' High Cube Dry"),
  carrier: z.string().optional(),
  sealNumber: z.string().optional(),
  tareWeightKg: z.coerce.number().optional(),
  maxPayloadKg: z.coerce.number().optional(),
  maxVolumeCbm: z.coerce.number().optional(),
  loadedWeightKg: z.coerce.number().optional(),
  loadedVolumeCbm: z.coerce.number().optional(),
  fillPercentage: z.coerce.number().optional(),
  currentShipmentId: z.string().optional(),
  currentShipmentNumber: z.string().optional(),
  status: z.string().default('Available at CFS Yard'),
  location: z.string().default('Miami CFS Yard'),
  originPort: z.string().optional(),
  dischargePort: z.string().optional(),
  temperatureControlled: z.boolean().optional().default(false),
});

export const updateContainerSchema = createContainerSchema.partial();

