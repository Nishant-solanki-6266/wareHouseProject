import { FastifyInstance } from 'fastify';
import { trackingController } from './tracking.controller.js';

export async function trackingRoutes(app: FastifyInstance): Promise<void> {
  // Public tracking endpoint
  app.get('/:trackingNumber', trackingController.lookup);
}
