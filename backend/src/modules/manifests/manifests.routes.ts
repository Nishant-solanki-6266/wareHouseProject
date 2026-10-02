import { FastifyInstance } from 'fastify';
import { manifestsController } from './manifests.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function manifestsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.get('/', manifestsController.list);
  app.get('/:id', manifestsController.getById);
  app.post('/', manifestsController.create);
  app.patch('/:id', manifestsController.update);
  app.delete('/:id', manifestsController.delete);
}
