import { AuditRepository, auditRepository } from './audit.repository.js';
import { AuditLogFilterParams, CreateAuditLogInput } from './audit.types.js';

export class AuditService {
  constructor(private readonly repo: AuditRepository = auditRepository) {}

  async listLogs(filters: AuditLogFilterParams) {
    return this.repo.findMany(filters);
  }

  async logAction(input: CreateAuditLogInput) {
    const totalCount = await this.repo.countTotal();
    const logNumber = `AUD-${String(9900 + totalCount + 1)}`;
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    return this.repo.create({
      logNumber,
      timestamp,
      userId: input.userId,
      userName: input.userName,
      userRole: input.userRole,
      module: input.module,
      action: input.action,
      recordId: input.recordId,
      description: input.description,
      ipAddress: input.ipAddress || '127.0.0.1',
      metadata: input.metadata || {},
    });
  }
}

export const auditService = new AuditService();
