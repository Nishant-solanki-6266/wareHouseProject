import { FastifyInstance } from 'fastify';
import { settingsController } from './settings.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { ROLES } from '../../common/constants/roles.js';

export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.get('/', settingsController.getAll);
  app.get('/:key', settingsController.getByKey);
  app.put('/:key', { preHandler: [requireRole(ROLES.SUPER_ADMIN)] }, settingsController.update);
  app.post('/clean-slate', { preHandler: [requireRole(ROLES.SUPER_ADMIN)] }, settingsController.cleanSlate);
}
