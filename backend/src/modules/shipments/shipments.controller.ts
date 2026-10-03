import { FastifyRequest, FastifyReply } from 'fastify';
import { ShipmentsService, shipmentsService } from './shipments.service.js';
import { shipmentQuerySchema, createShipmentSchema, updateShipmentSchema } from './shipments.schema.js';
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
      destinationCode: query.destinationCode || query.destination,
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

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = createShipmentSchema.parse(request.body);
    const created = await this.service.createShipment(body);
    reply.status(201).send(successResponse(created, 'Shipment created successfully'));
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const body = updateShipmentSchema.parse(request.body);
    const updated = await this.service.updateShipment(id, body);
    reply.send(successResponse(updated, 'Shipment updated successfully'));
  };

  delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    await this.service.deleteShipment(id);
    reply.send(successResponse(null, 'Shipment deleted successfully'));
  };
}

export const shipmentsController = new ShipmentsController();
