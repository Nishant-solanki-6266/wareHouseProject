import { eq, ilike, or, count, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { shipments, NewShipment } from '../../db/schema/index.js';
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
    const result = await db
      .select()
      .from(shipments)
      .where(or(eq(shipments.id, idOrNumber), eq(shipments.shipmentNumber, idOrNumber)))
      .limit(1);

    return result[0] || null;
  }

  async countTotal(): Promise<number> {
    const [{ total }] = await db.select({ total: count() }).from(shipments);
    return Number(total);
  }

  async create(data: NewShipment) {
    const [created] = await db
      .insert(shipments)
      .values(data)
      .returning();

    return created;
  }

  async update(id: string, data: Partial<NewShipment>) {
    const [updated] = await db
      .update(shipments)
      .set({ ...data, updatedAt: new Date() })
      .where(or(eq(shipments.id, id), eq(shipments.shipmentNumber, id)))
      .returning();

    return updated || null;
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(shipments)
      .where(or(eq(shipments.id, id), eq(shipments.shipmentNumber, id)))
      .returning();

    return !!deleted;
  }
}

export const shipmentsRepository = new ShipmentsRepository();
