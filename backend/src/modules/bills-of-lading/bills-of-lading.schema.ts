import { z } from 'zod';

export const billOfLadingQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  agentId: z.string().optional(),
});

export const holdActionSchema = z.object({
  reason: z.string().min(5, 'Hold reason is required'),
  holdCategory: z.string().optional().default('Financial Clearance'),
  holdNotes: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
});
