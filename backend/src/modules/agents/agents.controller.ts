import { FastifyRequest, FastifyReply } from 'fastify';
import { AgentsService, agentsService } from './agents.service.js';
import { createAgentSchema, updateAgentSchema } from './agents.schema.js';
import { successResponse } from '../../common/utils/response.js';

export class AgentsController {
  constructor(private readonly service: AgentsService = agentsService) {}

  list = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const agents = await this.service.listAgents();
    reply.send(successResponse(agents));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const agent = await this.service.getAgent(id);
    reply.send(successResponse(agent));
  };

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = createAgentSchema.parse(request.body);
    const created = await this.service.createAgent(body);
    reply.status(201).send(successResponse(created, 'Agent created successfully'));
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const body = updateAgentSchema.parse(request.body);
    const updated = await this.service.updateAgent(id, body);
    reply.send(successResponse(updated, 'Agent updated successfully'));
  };

  delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    await this.service.deleteAgent(id);
    reply.send(successResponse(null, 'Agent deleted successfully'));
  };
}


export const agentsController = new AgentsController();
