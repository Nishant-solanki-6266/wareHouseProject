import { z } from 'zod';

export const createPortSchema = z.object({
  portCode: z.string().min(2).max(10).toUpperCase(),
  name: z.string().min(2),
  island: z.string().optional(),
  country: z.string().min(2),
  defaultAgent: z.string().optional(),
});

export const updatePortSchema = createPortSchema.partial().extend({
  status: z.enum(['Active', 'Inactive']).optional(),
});
