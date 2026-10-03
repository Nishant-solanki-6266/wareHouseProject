import { z } from 'zod';

export const manifestQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
});

export const createManifestSchema = z.object({
  id: z.string().optional(),
  manifestNumber: z.string().optional(),
  type: z.string().optional().default('Ocean Cargo Inward / Outward Manifest'),
  title: z.string().optional().default('Ocean Cargo Customs Manifest'),
  vesselName: z.string().optional().default('M/V Caribbean Voyager'),
  voyageNumber: z.string().optional().default('VOY-2026-088'),
  flag: z.string().nullish(),
  masterName: z.string().nullish(),
  portOfLoading: z.string().optional().default('Port of Miami, USA (USMIA)'),
  portOfDischarge: z.string().optional().default('Nassau Container Port (BSNAS)'),
  departureDate: z.string().nullish(),
  arrivalDate: z.string().nullish(),
  carrier: z.string().nullish().default('Tropical Shipping'),

  totalBLs: z.coerce.number().optional().default(1),
  totalHouseBills: z.coerce.number().optional().default(0),
  totalContainers: z.coerce.number().optional().default(1),
  totalPackages: z.coerce.number().optional().default(0),
  totalPieces: z.coerce.number().optional().default(0),
  totalWeightLbs: z.coerce.number().nullish().default(0),
  totalWeightKg: z.coerce.number().nullish().default(0),
  totalCbm: z.coerce.number().nullish().default(0),
  totalCft: z.coerce.number().nullish().default(0),

  status: z.string().optional().default('Generated'),
  masterBLNumber: z.string().nullish(),
  masterBLId: z.string().nullish(),
  lineItems: z.array(z.any()).optional().default([]),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
}).passthrough();

export const updateManifestSchema = createManifestSchema.partial().passthrough();
