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
    const result = await db
      .select()
      .from(billsOfLading)
      .where(or(eq(billsOfLading.id, idOrNumber), eq(billsOfLading.blNumber, idOrNumber)))
      .limit(1);

    return result[0] || null;
  }

  async updateHoldStatus(id: string, status: string, holdDetails: HoldDetails) {
    const [updated] = await db
      .update(billsOfLading)
      .set({
        status,
        holdDetails,
        updatedAt: new Date(),
      })
      .where(or(eq(billsOfLading.id, id), eq(billsOfLading.blNumber, id)))
      .returning();

    return updated || null;
  }
}

export const billsOfLadingRepository = new BillsOfLadingRepository();
