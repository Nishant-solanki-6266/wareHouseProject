import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService, usersService } from './users.service.js';
import { createUserSchema, updateUserSchema, userQuerySchema } from './users.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class UsersController {
  constructor(private readonly service: UsersService = usersService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = userQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listUsers({
      search: query.search,
      role: query.role,
      status: query.status,
      limit,
      offset,
    });

    const meta = buildPaginationMeta(total, page, limit);
    reply.send(paginatedResponse(data, meta));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const user = await this.service.getUserById(id);
    reply.send(successResponse(user));
  };

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = createUserSchema.parse(request.body);
    const created = await this.service.createUser(body);
    reply.status(201).send(successResponse(created, 'User created successfully'));
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const body = updateUserSchema.parse(request.body);
    const updated = await this.service.updateUser(id, body);
    reply.send(successResponse(updated, 'User updated successfully'));
  };

  delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    await this.service.deleteUser(id);
    reply.send(successResponse(null, 'User deleted successfully'));
  };
}

export const usersController = new UsersController();
