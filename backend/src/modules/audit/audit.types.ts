export interface AuditLogFilterParams {
  search?: string;
  module?: string;
  userId?: string;
  limit: number;
  offset: number;
}

export interface CreateAuditLogInput {
  userId?: string;
  userName: string;
  userRole?: string;
  module: string;
  action: string;
  recordId?: string;
  description: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}
