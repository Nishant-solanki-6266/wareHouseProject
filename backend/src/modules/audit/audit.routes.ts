import { FastifyInstance } from 'fastify';
import { auditController } from './audit.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function auditRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.get('/', auditController.list);
  app.post('/', auditController.create);
}

