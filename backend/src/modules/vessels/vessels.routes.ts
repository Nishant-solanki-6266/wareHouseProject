import { FastifyInstance } from 'fastify';
import { vesselsController } from './vessels.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function vesselsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.get('/', vesselsController.list);
  app.get('/:id', vesselsController.getById);
}
