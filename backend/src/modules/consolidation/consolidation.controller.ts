import { FastifyRequest, FastifyReply } from 'fastify';
import { ConsolidationService, consolidationService } from './consolidation.service.js';
import { consolidationQuerySchema, createConsolidationSchema, updateConsolidationSchema } from './consolidation.schema.js';
import { successResponse, paginatedResponse, createdResponse } from '../../common/utils/response.js';
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

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = createConsolidationSchema.parse(request.body);
    const created = await this.service.createConsolidation(body, request.user as any);
    reply.status(201).send(createdResponse(created, 'Consolidation created and cascade executed successfully'));
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const body = updateConsolidationSchema.parse(request.body);
    const item = await this.service.updateConsolidation(id, body);
    reply.send(successResponse(item));
  };

  delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const success = await this.service.deleteConsolidation(id);
    reply.send(successResponse({ success }));
  };
}

export const consolidationController = new ConsolidationController();
