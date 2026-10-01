export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  WAREHOUSE_STAFF: 'operations',
  DOCUMENTATION_STAFF: 'documentation',
  PORT_AGENT: 'agent',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

export const ROLE_DISPLAY_NAMES: Record<RoleType, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.WAREHOUSE_STAFF]: 'Warehouse / Operations',
  [ROLES.DOCUMENTATION_STAFF]: 'Documentation Staff',
  [ROLES.PORT_AGENT]: 'Agent',
};

export const ALL_ROLES = Object.values(ROLES);
