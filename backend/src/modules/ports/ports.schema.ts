import { z } from 'zod';

export const createPortSchema = z.object({
  portCode: z.string().min(2).max(10).toUpperCase().optional(),
  code: z.string().min(2).max(10).toUpperCase().optional(),
  name: z.string().min(1),
  island: z.string().optional().nullable(),
  country: z.string().min(1),
  defaultAgent: z.string().optional().nullable(),
  status: z.string().optional(),
}).transform(val => ({
  portCode: (val.portCode || val.code || 'PRT').toUpperCase(),
  name: val.name,
  island: val.island || undefined,
  country: val.country,
  defaultAgent: val.defaultAgent || undefined,
  status: val.status || 'Active',
}));

export const updatePortSchema = z.object({
  portCode: z.string().min(2).max(10).toUpperCase().optional(),
  code: z.string().min(2).max(10).toUpperCase().optional(),
  name: z.string().min(1).optional(),
  island: z.string().optional().nullable(),
  country: z.string().optional(),
  defaultAgent: z.string().optional().nullable(),
  status: z.string().optional(),
}).transform(val => {
  const result: Record<string, any> = {};
  if (val.portCode || val.code) result.portCode = (val.portCode || val.code)?.toUpperCase();
  if (val.name !== undefined) result.name = val.name;
  if (val.island !== undefined) result.island = val.island || null;
  if (val.country !== undefined) result.country = val.country;
  if (val.defaultAgent !== undefined) result.defaultAgent = val.defaultAgent || null;
  if (val.status !== undefined) result.status = val.status;
  return result;
});

