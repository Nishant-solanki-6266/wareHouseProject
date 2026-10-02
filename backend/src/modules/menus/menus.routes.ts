import { FastifyInstance } from 'fastify';
import { menusController } from './menus.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function menuRoutes(app: FastifyInstance): Promise<void> {
  // Option to allow unauthenticated or authenticated access per route if needed, here with preHandler auth
  app.addHook('preHandler', authenticate);

  // STAGE 1: Warehouse Menus
  app.get('/cfs-dashboard', menusController.getCfsDashboard);
  app.get('/cargo-inventory', menusController.getCargoInventory);
  app.get('/labels', menusController.getLabels);
  app.get('/labels/:id', menusController.getLabels);

  // STAGE 2: Operations Menus
  app.get('/ops-dashboard', menusController.getOpsDashboard);
  app.get('/containers-vessels', menusController.getContainersVessels);

  // STAGE 3: Documentation Menus
  app.get('/docs-dashboard', menusController.getDocsDashboard);
  app.get('/shipping-manifests', menusController.getShippingManifests);
  app.get('/documents-archive', menusController.getDocumentsArchive);

  // STAGE 4: Destination Agent Menus
  app.get('/agent-dashboard', menusController.getAgentDashboard);
  app.get('/assigned-shipments', menusController.getAssignedShipments);
  app.get('/agent-documents', menusController.getAgentDocuments);

  // STAGE 5: Administrator Menus
  app.get('/admin-dashboard', menusController.getAdminDashboard);
  app.get('/users-roles', menusController.getUsersRoles);
  app.get('/audit-trail', menusController.getAuditTrail);
  app.get('/shipment-history', menusController.getShipmentHistory);
}
