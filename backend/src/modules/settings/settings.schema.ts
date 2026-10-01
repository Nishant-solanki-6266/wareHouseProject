import { z } from 'zod';

export const updateSettingSchema = z.object({
  value: z.record(z.unknown()),
  description: z.string().optional(),
});
