import { z } from 'zod';

export const manifestQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
});

export const createManifestSchema = z.object({
<<<<<<< HEAD
  manifestNumber: z.string().optional().nullable(),
  type: z.string().optional().nullable().default('Ocean Cargo Inward / Outward Manifest'),
  title: z.string().optional().nullable().default('Ocean Cargo Customs Manifest'),
  vesselName: z.string().optional().nullable().default('M/V Caribbean Voyager'),
  voyageNumber: z.string().optional().nullable().default('VOY-2026-088'),
  flag: z.string().optional().nullable(),
  masterName: z.string().optional().nullable(),
  portOfLoading: z.string().optional().nullable().default('Port of Miami, USA (USMIA)'),
  portOfDischarge: z.string().optional().nullable().default('Nassau Container Port (BSNAS)'),
  departureDate: z.string().optional().nullable(),
  arrivalDate: z.string().optional().nullable(),
  carrier: z.string().optional().nullable().default('Tropical Shipping'),
=======
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
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841

  totalBLs: z.coerce.number().optional().default(1),
  totalHouseBills: z.coerce.number().optional().default(0),
  totalContainers: z.coerce.number().optional().default(1),
  totalPackages: z.coerce.number().optional().default(0),
  totalPieces: z.coerce.number().optional().default(0),
  totalWeightLbs: z.coerce.number().nullish().default(0),
  totalWeightKg: z.coerce.number().nullish().default(0),
  totalCbm: z.coerce.number().nullish().default(0),
  totalCft: z.coerce.number().nullish().default(0),

<<<<<<< HEAD
  status: z.string().optional().nullable().default('Generated'),
  masterBLNumber: z.string().optional().nullable(),
  masterBLId: z.string().optional().nullable(),
=======
  status: z.string().optional().default('Generated'),
  masterBLNumber: z.string().nullish(),
  masterBLId: z.string().nullish(),
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
  lineItems: z.array(z.any()).optional().default([]),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
}).passthrough();

export const updateManifestSchema = createManifestSchema.partial().passthrough();
