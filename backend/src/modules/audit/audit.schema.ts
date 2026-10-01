import { z } from 'zod';

export const auditQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  module: z.string().optional(),
  userId: z.string().optional(),
});
