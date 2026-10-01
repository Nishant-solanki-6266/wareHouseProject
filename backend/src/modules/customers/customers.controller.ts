import { FastifyRequest, FastifyReply } from 'fastify';
import { CustomersService, customersService } from './customers.service.js';
import { createCustomerSchema, updateCustomerSchema, customerQuerySchema } from './customers.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class CustomersController {
  constructor(private readonly service: CustomersService = customersService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = customerQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listCustomers({
      search: query.search,
      destinationCode: query.destinationCode,
      status: query.status,
      limit,
      offset,
    });

    const meta = buildPaginationMeta(total, page, limit);
    reply.send(paginatedResponse(data, meta));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const customer = await this.service.getCustomerById(id);
    reply.send(successResponse(customer));
  };

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = createCustomerSchema.parse(request.body);
    const created = await this.service.createCustomer(body);
    reply.status(201).send(successResponse(created, 'Customer profile created successfully'));
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const body = updateCustomerSchema.parse(request.body);
    const updated = await this.service.updateCustomer(id, body);
    reply.send(successResponse(updated, 'Customer profile updated successfully'));
  };

  delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    await this.service.deleteCustomer(id);
    reply.send(successResponse(null, 'Customer profile deleted successfully'));
  };
}

export const customersController = new CustomersController();
