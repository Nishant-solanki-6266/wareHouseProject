import { eq, or, ilike } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { shipments, trackingEvents, houseBills, warehouseReceipts } from '../../db/schema/index.js';

export class TrackingRepository {
  async findByTrackingNumber(trackingNumber: string) {
    const clean = trackingNumber.trim();

    // 1. Search in master shipments by Tracking #, Shipment #, B/L #, Container #, Seal #
    const shipmentResult = await db
      .select()
      .from(shipments)
      .where(
        or(
          ilike(shipments.trackingNumber, clean),
          ilike(shipments.shipmentNumber, clean),
          ilike(shipments.billOfLadingNumber, clean),
          ilike(shipments.containerNumber, clean),
          ilike(shipments.sealNumber, clean)
        )
      )
      .limit(1);

    let shipment = shipmentResult[0] || null;

    // 2. If not found in shipments directly, check if it's a House B/L
    if (!shipment) {
      const hblResult = await db
        .select()
        .from(houseBills)
        .where(ilike(houseBills.hblNumber, clean))
        .limit(1);

      if (hblResult.length > 0 && hblResult[0].assignedShipmentId) {
        const parentShipment = await db
          .select()
          .from(shipments)
          .where(eq(shipments.id, hblResult[0].assignedShipmentId))
          .limit(1);
        shipment = parentShipment[0] || null;
      }
    }

    // 3. If not found, check if it's a Warehouse Receipt
    if (!shipment) {
      const wrResult = await db
        .select()
        .from(warehouseReceipts)
        .where(
          or(
            ilike(warehouseReceipts.receiptNumber, clean),
            ilike(warehouseReceipts.receiptNumber, clean.replace(/^WR-?/i, ''))
          )
        )
        .limit(1);

      if (wrResult.length > 0 && wrResult[0].assignedShipmentId) {
        const parentShipment = await db
          .select()
          .from(shipments)
          .where(eq(shipments.id, wrResult[0].assignedShipmentId))
          .limit(1);
        shipment = parentShipment[0] || null;
      }
    }

    if (!shipment) return null;

    const events = await db
      .select()
      .from(trackingEvents)
      .where(
        or(
          eq(trackingEvents.trackingNumber, shipment.trackingNumber),
          eq(trackingEvents.shipmentId, shipment.id)
        )
      )
      .orderBy(trackingEvents.checkpointIndex);

    return { shipment, events };
  }
}

export const trackingRepository = new TrackingRepository();
