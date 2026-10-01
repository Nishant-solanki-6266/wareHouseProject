import { FastifyRequest, FastifyReply } from 'fastify';
import { ManifestsService, manifestsService } from './manifests.service.js';
import { manifestQuerySchema } from './manifests.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class ManifestsController {
  constructor(private readonly service: ManifestsService = manifestsService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = manifestQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listManifests({
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
    const item = await this.service.getManifest(id);
    reply.send(successResponse(item));
  };
}

export const manifestsController = new ManifestsController();
