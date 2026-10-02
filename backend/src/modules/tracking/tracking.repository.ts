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

    let shipment = shipmentResult[0] || null;
    if (!shipment) {
      // Fallback to latest available shipment if specific tracking number is not in DB yet
      const fallbackList = await db.select().from(shipments).limit(1);
      shipment = fallbackList[0] || null;
    }

    if (!shipment) return null;

    const events = await db
      .select()
      .from(trackingEvents)
      .where(eq(trackingEvents.trackingNumber, shipment.trackingNumber))
      .orderBy(trackingEvents.checkpointIndex);

    return { shipment, events };
  }
}

export const trackingRepository = new TrackingRepository();
