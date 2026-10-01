import { FastifyInstance } from 'fastify';
import { customersController } from './customers.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function customersRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.get('/', customersController.list);
  app.get('/:id', customersController.getById);
  app.post('/', customersController.create);
  app.patch('/:id', customersController.update);
  app.delete('/:id', customersController.delete);
}
