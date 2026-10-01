import { z } from 'zod';

export const documentQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  documentType: z.string().optional(),
});
