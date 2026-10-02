import { eq, ilike, or, count, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { billsOfLading, HoldDetails } from '../../db/schema/index.js';
import { BillOfLadingFilterParams } from './bills-of-lading.types.js';

export class BillsOfLadingRepository {
  async findMany(filters: BillOfLadingFilterParams) {
    const conditions = [];

    if (filters.status && filters.status !== 'All') {
      conditions.push(eq(billsOfLading.status, filters.status));
    }
    if (filters.agentId && filters.agentId !== 'All') {
      conditions.push(eq(billsOfLading.agentId, filters.agentId));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(billsOfLading.blNumber, `%${filters.search}%`),
          ilike(billsOfLading.shipmentNumber, `%${filters.search}%`),
          ilike(billsOfLading.containerNumber, `%${filters.search}%`),
          ilike(billsOfLading.oceanVessel, `%${filters.search}%`),
          ilike(billsOfLading.cargoDescription, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(billsOfLading)
      .where(whereClause)
      .orderBy(desc(billsOfLading.createdAt))
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(billsOfLading)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async findByIdOrNumber(idOrNumber: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
    const whereCondition = isUuid
      ? or(eq(billsOfLading.id, idOrNumber), eq(billsOfLading.blNumber, idOrNumber), eq(billsOfLading.shipmentId, idOrNumber))
      : or(eq(billsOfLading.blNumber, idOrNumber), eq(billsOfLading.shipmentNumber, idOrNumber), eq(billsOfLading.containerNumber, idOrNumber));

    const result = await db
      .select()
      .from(billsOfLading)
      .where(whereCondition)
      .limit(1);

    return result[0] || null;
  }

  async updateHoldStatus(id: string, status: string, holdDetails: HoldDetails) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const whereCondition = isUuid
      ? or(eq(billsOfLading.id, id), eq(billsOfLading.blNumber, id))
      : eq(billsOfLading.blNumber, id);

    const [updated] = await db
      .update(billsOfLading)
      .set({
        status,
        holdDetails,
        updatedAt: new Date(),
      })
      .where(whereCondition)
      .returning();

    return updated || null;
  }

  async create(data: Partial<typeof billsOfLading.$inferInsert>) {
    const [created] = await db
      .insert(billsOfLading)
      .values(data as any)
      .returning();
    return created;
  }

  async update(idOrNumber: string, data: Partial<typeof billsOfLading.$inferInsert>) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
    const whereCondition = isUuid
      ? or(eq(billsOfLading.id, idOrNumber), eq(billsOfLading.blNumber, idOrNumber))
      : eq(billsOfLading.blNumber, idOrNumber);

    const [updated] = await db
      .update(billsOfLading)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(whereCondition)
      .returning();

    return updated || null;
  }

  async delete(idOrNumber: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
    const whereCondition = isUuid
      ? or(eq(billsOfLading.id, idOrNumber), eq(billsOfLading.blNumber, idOrNumber))
      : eq(billsOfLading.blNumber, idOrNumber);

    const [deleted] = await db
      .delete(billsOfLading)
      .where(whereCondition)
      .returning();

    return !!deleted;
  }
}

export const billsOfLadingRepository = new BillsOfLadingRepository();
