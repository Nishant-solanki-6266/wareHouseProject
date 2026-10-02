import { z } from 'zod';
import { createShipmentSchema, updateShipmentSchema } from './shipments.schema.js';

export interface ShipmentFilterParams {
  search?: string;
  status?: string;
  destinationCode?: string;
  agentId?: string;
  limit: number;
  offset: number;
}

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;
