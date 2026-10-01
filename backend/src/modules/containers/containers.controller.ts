import { FastifyRequest, FastifyReply } from 'fastify';
import { ContainersService, containersService } from './containers.service.js';
import { containerQuerySchema } from './containers.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class ContainersController {
  constructor(private readonly service: ContainersService = containersService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = containerQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listContainers({
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
    const item = await this.service.getContainer(id);
    reply.send(successResponse(item));
  };
}

export const containersController = new ContainersController();
