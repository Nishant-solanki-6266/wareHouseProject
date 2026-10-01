import { FastifyRequest, FastifyReply } from 'fastify';
import { VoyagesService, voyagesService } from './voyages.service.js';
import { voyageQuerySchema } from './voyages.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class VoyagesController {
  constructor(private readonly service: VoyagesService = voyagesService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = voyageQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listVoyages({
      search: query.search,
      status: query.status,
      limit,
      offset,
    });

    const meta = buildPaginationMeta(total, page, limit);
    reply.send(paginatedResponse(data, meta));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const item = await this.service.getVoyage(id);
    reply.send(successResponse(item));
  };
}

export const voyagesController = new VoyagesController();
