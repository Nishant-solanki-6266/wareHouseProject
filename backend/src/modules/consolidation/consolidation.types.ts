import { z } from 'zod';
import { createConsolidationSchema, updateConsolidationSchema } from './consolidation.schema.js';

export interface ConsolidationFilterParams {
  search?: string;
  status?: string;
  destinationCode?: string;
  limit: number;
  offset: number;
}

export type CreateConsolidationInput = z.infer<typeof createConsolidationSchema>;
export type UpdateConsolidationInput = z.infer<typeof updateConsolidationSchema>;
