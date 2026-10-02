import { z } from 'zod';

export const auditQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  module: z.string().optional(),
  userId: z.string().optional(),
});

export const createAuditLogSchema = z.object({
  userId: z.string().optional(),
  userName: z.string().optional(),
  userRole: z.string().optional(),
  module: z.string().min(1, 'Module is required'),
  action: z.string().min(1, 'Action is required'),
  recordId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  ipAddress: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

