import { FastifyInstance } from 'fastify';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { ROLES } from '../../common/constants/roles.js';

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  // All user management routes require authentication and Super Admin role
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireRole(ROLES.SUPER_ADMIN));

  app.get('/', usersController.list);
  app.get('/:id', usersController.getById);
  app.post('/', usersController.create);
  app.patch('/:id', usersController.update);
  app.delete('/:id', usersController.delete);
}
