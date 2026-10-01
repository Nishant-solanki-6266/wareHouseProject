import { z } from 'zod';

export const trackingLookupSchema = z.object({
  trackingNumber: z.string().min(3, 'Tracking number is required'),
});
