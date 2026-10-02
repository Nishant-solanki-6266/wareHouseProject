import { FastifyRequest, FastifyReply } from 'fastify';
import { ContainersService, containersService } from './containers.service.js';
import { containerQuerySchema, createContainerSchema, updateContainerSchema } from './containers.schema.js';
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

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = createContainerSchema.parse(request.body);
    const created = await this.service.createContainer(body);
    reply.status(201).send(successResponse(created, 'Container created successfully'));
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const body = updateContainerSchema.parse(request.body);
    const updated = await this.service.updateContainer(id, body);
    reply.send(successResponse(updated, 'Container updated successfully'));
  };

  delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    await this.service.deleteContainer(id);
    reply.send(successResponse(null, 'Container deleted successfully'));
  };
}


export const containersController = new ContainersController();
