import { z } from 'zod';

export const createAgentSchema = z.object({
  agentCode: z.string().min(2),
  name: z.string().min(2),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  territory: z.string().optional(),
  address: z.string().optional(),
  assignedPortCode: z.string().optional(),
  creditLimitUsd: z.string().optional(),
});

export const updateAgentSchema = createAgentSchema.partial().extend({
  status: z.enum(['Active', 'Inactive']).optional(),
  currentBalanceUsd: z.string().optional(),
});
