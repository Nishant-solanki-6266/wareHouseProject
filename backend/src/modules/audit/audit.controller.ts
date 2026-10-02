import { FastifyRequest, FastifyReply } from 'fastify';
import { AuditService, auditService } from './audit.service.js';
import { auditQuerySchema, createAuditLogSchema } from './audit.schema.js';
import { paginatedResponse, successResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class AuditController {
  constructor(private readonly service: AuditService = auditService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = auditQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listLogs({
      search: query.search,
      module: query.module,
      userId: query.userId,
      limit,
      offset,
    });

    const meta = buildPaginationMeta(total, page, limit);
    reply.send(paginatedResponse(data, meta));
  };

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = createAuditLogSchema.parse(request.body);
    const authUser = request.user as { id?: string; name?: string; roleKey?: string } | undefined;

    const created = await this.service.logAction({
      userId: body.userId || authUser?.id,
      userName: body.userName || authUser?.name || 'System User',
      userRole: body.userRole || authUser?.roleKey,
      module: body.module,
      action: body.action,
      recordId: body.recordId,
      description: body.description,
      ipAddress: request.ip || body.ipAddress,
      metadata: body.metadata,
    });

    reply.status(201).send(successResponse(created, 'Audit log created successfully'));
  };
}

export const auditController = new AuditController();

