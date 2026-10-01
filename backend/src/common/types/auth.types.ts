import { RoleType } from '../constants/roles.js';

export interface JwtUserPayload {
  id: string;
  email: string;
  name: string;
  roleKey: RoleType;
  agentId?: string | null;
  destinationPortCode?: string | null;
}

export interface AuthenticatedUser extends JwtUserPayload {
  department?: string | null;
  status: string;
}
