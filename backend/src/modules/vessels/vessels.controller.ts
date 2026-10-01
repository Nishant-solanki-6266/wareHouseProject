import { FastifyRequest, FastifyReply } from 'fastify';
import { VesselsService, vesselsService } from './vessels.service.js';
import { vesselQuerySchema } from './vessels.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class VesselsController {
  constructor(private readonly service: VesselsService = vesselsService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = vesselQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listVessels({
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
    const item = await this.service.getVessel(id);
    reply.send(successResponse(item));
  };
}

export const vesselsController = new VesselsController();
