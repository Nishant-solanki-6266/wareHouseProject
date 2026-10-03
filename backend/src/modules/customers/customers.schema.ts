import { z } from 'zod';

export const createCustomerSchema = z.object({
  customerNumber: z.string().optional(),
  createdDate: z.string().optional(),
  name: z.string().min(2, 'Customer name is required'),
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  telephone: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  destinationPort: z.string().optional(),
  destinationCode: z.string().optional(),
  taxId: z.string().optional(),
  accountType: z.string().optional(),
  creditTerms: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
});

export const customerQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  destinationCode: z.string().optional(),
  status: z.string().optional(),
});
