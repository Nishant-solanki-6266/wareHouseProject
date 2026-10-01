export interface CustomerFilterParams {
  search?: string;
  destinationCode?: string;
  status?: string;
  limit: number;
  offset: number;
}

export interface CreateCustomerInput {
  name: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  telephone?: string;
  phone?: string;
  address?: string;
  destinationPort?: string;
  destinationCode?: string;
  taxId?: string;
  accountType?: string;
  creditTerms?: string;
  notes?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  status?: string;
}
