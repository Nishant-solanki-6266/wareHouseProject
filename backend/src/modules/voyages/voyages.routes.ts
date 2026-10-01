import { FastifyInstance } from 'fastify';
import { voyagesController } from './voyages.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function voyagesRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.get('/', voyagesController.list);
  app.get('/:id', voyagesController.getById);
}
