import { FastifyInstance } from 'fastify';
import { houseBillsController } from './house-bills.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforcePortIsolation } from '../../middleware/port-isolation.middleware.js';

export async function houseBillsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', enforcePortIsolation);

  app.get('/', houseBillsController.list);
  app.get('/:id', houseBillsController.getById);
  app.post('/', houseBillsController.create);
}
