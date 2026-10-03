import { FastifyInstance } from 'fastify';
import { trackingController } from './tracking.controller.js';

export async function trackingRoutes(app: FastifyInstance): Promise<void> {
  // Tracking events CRUD (must precede parameter route)
  app.get('/events', trackingController.listEvents);
  app.post('/events', trackingController.createEvent);
  app.patch('/events/:id', trackingController.updateEvent);
  app.put('/events/:id', trackingController.updateEvent);
  app.delete('/events/:id', trackingController.deleteEvent);

  // Public tracking lookup
  app.get('/:trackingNumber', trackingController.lookup);
}
