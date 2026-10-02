import { z } from 'zod';
import { createBillOfLadingSchema, updateBillOfLadingSchema } from './bills-of-lading.schema.js';

export interface BillOfLadingFilterParams {
  search?: string;
  status?: string;
  agentId?: string;
  limit: number;
  offset: number;
}

export type CreateBillOfLadingInput = z.infer<typeof createBillOfLadingSchema>;
export type UpdateBillOfLadingInput = z.infer<typeof updateBillOfLadingSchema>;
