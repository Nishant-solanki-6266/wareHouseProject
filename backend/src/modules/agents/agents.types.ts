export interface CreateAgentInput {
  agentCode: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  territory?: string;
  address?: string;
  assignedPortCode?: string;
  creditLimitUsd?: string;
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {
  status?: string;
  currentBalanceUsd?: string;
}
