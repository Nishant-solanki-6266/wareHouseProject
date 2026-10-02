import { FastifyRequest, FastifyReply } from 'fastify';
import { AdminService, adminService } from './admin.service.js';
import { successResponse } from '../../common/utils/response.js';

export class AdminController {
  constructor(private readonly service: AdminService = adminService) {}

  dashboard = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const data = await this.service.getDashboard();
    reply.send(successResponse(data));
  };
}

export const adminController = new AdminController();
