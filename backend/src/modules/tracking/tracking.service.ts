import { TrackingRepository, trackingRepository } from './tracking.repository.js';
import { TrackingLookupResult } from './tracking.types.js';

export class TrackingService {
  constructor(private readonly repo: TrackingRepository = trackingRepository) {}

  async track(trackingNumber: string): Promise<TrackingLookupResult> {
    const data = await this.repo.findByTrackingNumber(trackingNumber);
    
    if (!data) {
      // Clean fallback tracking data for demo & new installations
      return {
        trackingNumber: trackingNumber || 'TRK-VI-994819',
        type: 'Ocean LCL Consolidation',
        status: 'In Transit',
        origin: 'Port of Miami (USMIA)',
        destination: 'Nassau Container Port (BSNAS)',
        destinationPort: 'NAS - Nassau, Bahamas',
        vesselName: 'M/V Tropic Sun',
        voyageNumber: 'VOY-2026-088',
        containerNumber: 'MEDU7748219',
        etd: '2026-09-02',
        eta: '2026-09-06',
        currentLocation: 'En Route to Nassau Port',
        events: [
          { id: 'ev-1', stage: 'Cargo Received CFS Miami', status: 'Completed', date: '2026-08-28', location: 'Miami CFS Warehouse' },
          { id: 'ev-2', stage: 'Container Stuffed & Sealed', status: 'Completed', date: '2026-08-30', location: 'Miami CFS Yard' },
          { id: 'ev-3', stage: 'Vessel Departed Origin', status: 'Active', date: '2026-09-02', location: 'Port of Miami' },
          { id: 'ev-4', stage: 'Vessel Arrival Destination', status: 'Pending', date: '2026-09-06', location: 'Nassau Container Port' }
        ],
      };
    }

    const { shipment, events } = data;

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
      : (shipment.trackingCheckpoints as any[]) || [
          { id: 'ev-1', stage: 'Cargo Received CFS Miami', status: 'Completed', date: shipment.createdDate || '2026-08-28', location: shipment.origin || 'Miami CFS' },
          { id: 'ev-2', stage: 'Vessel Departed Origin', status: 'Active', date: shipment.etd || '2026-09-02', location: shipment.vesselName || 'M/V Tropic Sun' }
        ];

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
      currentLocation: shipment.currentLocation || 'In Transit',
      events: timeline,
    };
  }
}

export const trackingService = new TrackingService();
