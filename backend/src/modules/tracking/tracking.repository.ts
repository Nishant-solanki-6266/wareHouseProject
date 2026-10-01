import { eq, or } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { shipments, trackingEvents } from '../../db/schema/index.js';

export class TrackingRepository {
  async findByTrackingNumber(trackingNumber: string) {
    const shipmentResult = await db
      .select()
      .from(shipments)
      .where(or(eq(shipments.trackingNumber, trackingNumber), eq(shipments.shipmentNumber, trackingNumber)))
      .limit(1);

    const shipment = shipmentResult[0] || null;
    if (!shipment) return null;

    const events = await db
      .select()
      .from(trackingEvents)
      .where(eq(trackingEvents.trackingNumber, trackingNumber))
      .orderBy(trackingEvents.checkpointIndex);

    return { shipment, events };
  }
}

export const trackingRepository = new TrackingRepository();
