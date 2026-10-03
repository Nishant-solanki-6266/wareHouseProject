export interface CustomerFilterParams {
  search?: string;
  destinationCode?: string;
  status?: string;
  limit: number;
  offset: number;
}

export interface CreateCustomerInput {
  customerNumber?: string;
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
<<<<<<< HEAD
  customerNumber?: string;
=======
  status?: string;
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
  createdDate?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  status?: string;
}
