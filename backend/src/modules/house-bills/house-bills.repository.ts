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
    const result = await db
      .select()
      .from(houseBills)
      .where(or(eq(houseBills.id, idOrHblNumber), eq(houseBills.hblNumber, idOrHblNumber)))
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
}

export const houseBillsRepository = new HouseBillsRepository();
