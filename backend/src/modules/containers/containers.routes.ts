import { FastifyInstance } from 'fastify';
import { containersController } from './containers.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function containersRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.get('/', containersController.list);
  app.get('/:id', containersController.getById);
}
