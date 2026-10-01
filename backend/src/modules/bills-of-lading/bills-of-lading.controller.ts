import { FastifyRequest, FastifyReply } from 'fastify';
import { BillsOfLadingService, billsOfLadingService } from './bills-of-lading.service.js';
import { billOfLadingQuerySchema, holdActionSchema } from './bills-of-lading.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class BillsOfLadingController {
  constructor(private readonly service: BillsOfLadingService = billsOfLadingService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = billOfLadingQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listBills({
      search: query.search,
      status: query.status,
      agentId: query.agentId,
      limit,
      offset,
    });

    const meta = buildPaginationMeta(total, page, limit);
    reply.send(paginatedResponse(data, meta));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const item = await this.service.getBill(id);
    reply.send(successResponse(item));
  };

  placeHold = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const body = holdActionSchema.parse(request.body);
    const currentUser = request.user.name || 'System User';

    const updated = await this.service.placeHold(id, {
      ...body,
      placedBy: currentUser,
    });

    reply.send(successResponse(updated, 'Bill of Lading placed ON HOLD successfully'));
  };

  clearHold = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const currentUser = request.user.name || 'System User';

    const updated = await this.service.clearHold(id, currentUser);
    reply.send(successResponse(updated, 'Hold cleared and Bill of Lading RELEASED successfully'));
  };
}

export const billsOfLadingController = new BillsOfLadingController();
