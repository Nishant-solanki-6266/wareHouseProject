import { TrackingRepository, trackingRepository } from './tracking.repository.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { TrackingLookupResult } from './tracking.types.js';

export class TrackingService {
  constructor(private readonly repo: TrackingRepository = trackingRepository) {}

  async track(trackingNumber: string): Promise<TrackingLookupResult> {
    const data = await this.repo.findByTrackingNumber(trackingNumber);
    if (!data) {
      throw new NotFoundError(`Shipment with tracking number '${trackingNumber}'`);
    }

    const { shipment, events } = data;

    // Use checkpoints stored on shipment or standalone events
    const timeline = events.length > 0
      ? events.map((e) => ({
          id: e.id,
          stage: e.stage,
          status: e.status,
          date: e.eventDate,
          time: e.eventTime,
          location: e.location,
          notes: e.notes,
        }))
      : (shipment.trackingCheckpoints as any[]) || [];

    return {
      trackingNumber: shipment.trackingNumber,
      type: shipment.type,
      status: shipment.status,
      origin: shipment.origin,
      destination: shipment.destination,
      destinationPort: shipment.destinationPort,
      vesselName: shipment.vesselName,
      voyageNumber: shipment.voyageNumber,
      containerNumber: shipment.containerNumber,
      etd: shipment.etd,
      eta: shipment.eta,
      currentLocation: shipment.currentLocation,
      events: timeline,
    };
  }
}

export const trackingService = new TrackingService();
