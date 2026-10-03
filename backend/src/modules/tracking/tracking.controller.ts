import { FastifyRequest, FastifyReply } from 'fastify';
import { TrackingService, trackingService } from './tracking.service.js';
import { trackingLookupSchema } from './tracking.schema.js';
import { successResponse } from '../../common/utils/response.js';

export class TrackingController {
  constructor(private readonly service: TrackingService = trackingService) {}

  lookup = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { trackingNumber } = trackingLookupSchema.parse(request.params);
    const result = await this.service.track(trackingNumber);
    reply.send(successResponse(result));
  };

  listEvents = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = (request.query as { trackingNumber?: string }) || {};
    const events = await this.service.listEvents(query.trackingNumber);
    reply.send(successResponse(events));
  };

  createEvent = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = (request.body as Record<string, unknown>) || {};
    const created = await this.service.createEvent(body);
    reply.status(201).send(successResponse(created, 'Tracking event created successfully'));
  };

  updateEvent = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const body = (request.body as Record<string, unknown>) || {};
    const updated = await this.service.updateEvent(id, body);
    reply.send(successResponse(updated, 'Tracking event updated successfully'));
  };

  deleteEvent = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const success = await this.service.deleteEvent(id);
    reply.send(successResponse({ success }, 'Tracking event deleted successfully'));
  };
}

export const trackingController = new TrackingController();
