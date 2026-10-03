import { AuditRepository, auditRepository } from './audit.repository.js';
import { AuditLogFilterParams, CreateAuditLogInput } from './audit.types.js';

export class AuditService {
  constructor(private readonly repo: AuditRepository = auditRepository) {}

  async listLogs(filters: AuditLogFilterParams) {
    return this.repo.findMany(filters);
  }

  async logAction(input: CreateAuditLogInput) {
    const totalCount = await this.repo.countTotal().catch(() => 0);
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const logNumber = `AUD-${String(9900 + totalCount + 1)}-${randSuffix}`;
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    const isUuid = input.userId
      ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.userId)
      : false;

    return this.repo.create({
      logNumber,
      timestamp,
      userId: isUuid ? input.userId : undefined,
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
