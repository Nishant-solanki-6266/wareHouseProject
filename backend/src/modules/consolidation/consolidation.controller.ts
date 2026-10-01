import { FastifyRequest, FastifyReply } from 'fastify';
import { ConsolidationService, consolidationService } from './consolidation.service.js';
import { consolidationQuerySchema } from './consolidation.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class ConsolidationController {
  constructor(private readonly service: ConsolidationService = consolidationService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = consolidationQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listConsolidations({
      search: query.search,
      status: query.status,
      destinationCode: query.destinationCode,
      limit,
      offset,
    });

    const meta = buildPaginationMeta(total, page, limit);
    reply.send(paginatedResponse(data, meta));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const item = await this.service.getConsolidation(id);
    reply.send(successResponse(item));
  };
}

export const consolidationController = new ConsolidationController();
