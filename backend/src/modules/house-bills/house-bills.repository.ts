import { eq, ilike, or, count, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { houseBills, NewHouseBill } from '../../db/schema/index.js';
import { HouseBillFilterParams } from './house-bills.types.js';

export class HouseBillsRepository {
  async findMany(filters: HouseBillFilterParams) {
    const conditions = [];

    if (filters.status && filters.status !== 'All') {
      conditions.push(eq(houseBills.status, filters.status));
    }
    if (filters.destinationCode && filters.destinationCode !== 'All') {
      conditions.push(eq(houseBills.destinationCode, filters.destinationCode));
    }
    if (filters.customerId && filters.customerId !== 'All') {
      conditions.push(eq(houseBills.customerId, filters.customerId));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(houseBills.hblNumber, `%${filters.search}%`),
          ilike(houseBills.customerName, `%${filters.search}%`),
          ilike(houseBills.cargoDescription, `%${filters.search}%`),
          ilike(houseBills.destinationPort, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(houseBills)
      .where(whereClause)
      .orderBy(desc(houseBills.createdAt))
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(houseBills)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async findByIdOrHblNumber(idOrHblNumber: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrHblNumber);
    const condition = isUuid
      ? or(eq(houseBills.id, idOrHblNumber), eq(houseBills.hblNumber, idOrHblNumber))
      : eq(houseBills.hblNumber, idOrHblNumber);

    const result = await db
      .select()
      .from(houseBills)
      .where(condition)
      .limit(1);

    return result[0] || null;
  }

  async countTotal() {
    const [{ total }] = await db.select({ total: count() }).from(houseBills);
    return Number(total);
  }

  async create(data: NewHouseBill) {
    const [created] = await db.insert(houseBills).values(data).returning();
    return created;
  }

  async update(id: string, data: any) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid
      ? or(eq(houseBills.id, id), eq(houseBills.hblNumber, id))
      : eq(houseBills.hblNumber, id);

    const [updated] = await db
      .update(houseBills)
      .set({ ...data, updatedAt: new Date() })
      .where(condition)
      .returning();
    return updated || null;
  }

  async delete(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid
      ? or(eq(houseBills.id, id), eq(houseBills.hblNumber, id))
      : eq(houseBills.hblNumber, id);

    const [deleted] = await db
      .delete(houseBills)
      .where(condition)
      .returning();
    return !!deleted;
  }
}



export const houseBillsRepository = new HouseBillsRepository();
