import { FastifyRequest, FastifyReply } from 'fastify';
import { HouseBillsService, houseBillsService } from './house-bills.service.js';
import { createHouseBillSchema, houseBillQuerySchema } from './house-bills.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class HouseBillsController {
  constructor(private readonly service: HouseBillsService = houseBillsService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = houseBillQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listHouseBills({
      search: query.search,
      status: query.status,
      destinationCode: query.destinationCode,
      customerId: query.customerId,
      limit,
      offset,
    });

    const meta = buildPaginationMeta(total, page, limit);
    reply.send(paginatedResponse(data, meta));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const hbl = await this.service.getHouseBill(id);
    reply.send(successResponse(hbl));
  };

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = createHouseBillSchema.parse(request.body);
    const created = await this.service.createHouseBill(body);
    reply.status(201).send(successResponse(created, 'House Bill of Lading created successfully'));
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const updated = await this.service.updateHouseBill(id, request.body);
    reply.send(successResponse(updated, 'House Bill of Lading updated successfully'));
  };

  delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    await this.service.deleteHouseBill(id);
    reply.send(successResponse(null, 'House Bill of Lading deleted successfully'));
  };

  placeHold = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const currentUser = (request.user as any)?.name || 'Documentation Staff';
    const updated = await this.service.placeHold(id, {
      ...body,
      placedBy: currentUser,
    });
    reply.send(successResponse(updated, 'House Bill of Lading placed ON HOLD'));
  };

  releaseHold = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const updated = await this.service.releaseHold(id);
    reply.send(successResponse(updated, 'House Bill of Lading hold RELEASED'));
  };
}

export const houseBillsController = new HouseBillsController();

