import { FastifyRequest, FastifyReply } from 'fastify';
import { CargoService, cargoService } from './cargo.service.js';
import { cargoQuerySchema } from './cargo.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class CargoController {
  constructor(private readonly service: CargoService = cargoService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = cargoQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listCargo({
      search: query.search,
      status: query.status,
      destinationCode: query.destinationCode,
      warehouseReceiptId: query.warehouseReceiptId,
      limit,
      offset,
    });

    const meta = buildPaginationMeta(total, page, limit);
    reply.send(paginatedResponse(data, meta));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const item = await this.service.getCargo(id);
    reply.send(successResponse(item));
  };
}

export const cargoController = new CargoController();
