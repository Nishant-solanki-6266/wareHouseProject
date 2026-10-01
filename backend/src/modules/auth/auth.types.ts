import { RoleType } from '../../common/constants/roles.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUserResponse {
  id: string;
  userCode?: string | null;
  name: string;
  email: string;
  roleKey: RoleType;
  department?: string | null;
  avatar?: string | null;
  status: string;
  agentId?: string | null;
  destinationPortCode?: string | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUserResponse;
}
