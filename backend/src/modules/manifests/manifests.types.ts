import { z } from 'zod';
import { createManifestSchema, updateManifestSchema } from './manifests.schema.js';

export interface ManifestFilterParams {
  search?: string;
  status?: string;
  limit: number;
  offset: number;
}

export type CreateManifestInput = z.infer<typeof createManifestSchema>;
export type UpdateManifestInput = z.infer<typeof updateManifestSchema>;
