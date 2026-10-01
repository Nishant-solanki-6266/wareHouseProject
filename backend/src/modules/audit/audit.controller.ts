import { FastifyRequest, FastifyReply } from 'fastify';
import { AuditService, auditService } from './audit.service.js';
import { auditQuerySchema } from './audit.schema.js';
import { paginatedResponse } from '../../common/utils/response.js';
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
}

export const auditController = new AuditController();
