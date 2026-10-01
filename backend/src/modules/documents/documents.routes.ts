import { FastifyInstance } from 'fastify';
import { documentsController } from './documents.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function documentsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.get('/', documentsController.list);
  app.get('/:id', documentsController.getById);
}
