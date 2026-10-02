import { eq, ilike, or, count, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { shipments } from '../../db/schema/index.js';
import { ShipmentFilterParams } from './shipments.types.js';

export class ShipmentsRepository {
  async findMany(filters: ShipmentFilterParams) {
    const conditions = [];

    if (filters.status && filters.status !== 'All') {
      conditions.push(eq(shipments.status, filters.status));
    }
    if (filters.destinationCode && filters.destinationCode !== 'All') {
      conditions.push(eq(shipments.destinationCode, filters.destinationCode));
    }
    if (filters.agentId && filters.agentId !== 'All') {
      conditions.push(eq(shipments.agentId, filters.agentId));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(shipments.shipmentNumber, `%${filters.search}%`),
          ilike(shipments.trackingNumber, `%${filters.search}%`),
          ilike(shipments.containerNumber, `%${filters.search}%`),
          ilike(shipments.vesselName, `%${filters.search}%`),
          ilike(shipments.billOfLadingNumber, `%${filters.search}%`),
          ilike(shipments.destinationPort, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(shipments)
      .where(whereClause)
      .orderBy(desc(shipments.createdAt))
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(shipments)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async findByIdOrNumber(idOrNumber: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
    const condition = isUuid
      ? or(eq(shipments.id, idOrNumber), eq(shipments.shipmentNumber, idOrNumber))
      : eq(shipments.shipmentNumber, idOrNumber);

    const result = await db
      .select()
      .from(shipments)
      .where(condition)
      .limit(1);

    return result[0] || null;
  }

}

export const shipmentsRepository = new ShipmentsRepository();
