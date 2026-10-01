import { FastifyRequest, FastifyReply } from 'fastify';
import { ShipmentsService, shipmentsService } from './shipments.service.js';
import { shipmentQuerySchema } from './shipments.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class ShipmentsController {
  constructor(private readonly service: ShipmentsService = shipmentsService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = shipmentQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listShipments({
      search: query.search,
      status: query.status,
      destinationCode: query.destinationCode,
      agentId: query.agentId,
      limit,
      offset,
    });

    const meta = buildPaginationMeta(total, page, limit);
    reply.send(paginatedResponse(data, meta));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const item = await this.service.getShipment(id);
    reply.send(successResponse(item));
  };
}

export const shipmentsController = new ShipmentsController();
