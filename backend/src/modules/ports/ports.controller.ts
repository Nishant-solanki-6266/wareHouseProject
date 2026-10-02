import { FastifyRequest, FastifyReply } from 'fastify';
import { PortsService, portsService } from './ports.service.js';
import { createPortSchema, updatePortSchema } from './ports.schema.js';
import { successResponse } from '../../common/utils/response.js';

export class PortsController {
  constructor(private readonly service: PortsService = portsService) {}

  list = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const ports = await this.service.listPorts();
    reply.send(successResponse(ports));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const port = await this.service.getPort(id);
    reply.send(successResponse(port));
  };

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = createPortSchema.parse(request.body);
    const created = await this.service.createPort(body);
    reply.status(201).send(successResponse(created, 'Port created successfully'));
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const body = updatePortSchema.parse(request.body);
    const updated = await this.service.updatePort(id, body);
    reply.send(successResponse(updated, 'Port updated successfully'));
  };

  delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    await this.service.deletePort(id);
    reply.send(successResponse({ deleted: true }, 'Port deleted successfully'));
  };
}

export const portsController = new PortsController();
