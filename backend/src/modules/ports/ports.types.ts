export interface CreatePortInput {
  portCode: string;
  name: string;
  island?: string;
  country: string;
  defaultAgent?: string;
  status?: string;
}

export interface UpdatePortInput extends Partial<CreatePortInput> {
  status?: string;
}
