import { eq, ilike, or, count, and } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { cargo } from '../../db/schema/index.js';
import { CargoFilterParams } from './cargo.types.js';

export class CargoRepository {
  async findMany(filters: CargoFilterParams) {
    const conditions = [];

    if (filters.status && filters.status !== 'All') {
      conditions.push(eq(cargo.status, filters.status));
    }
    if (filters.destinationCode && filters.destinationCode !== 'All') {
      conditions.push(eq(cargo.destinationCode, filters.destinationCode));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(cargo.cargoNumber, `%${filters.search}%`),
          ilike(cargo.receiptNumber, `%${filters.search}%`),
          ilike(cargo.customer, `%${filters.search}%`),
          ilike(cargo.description, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(cargo)
      .where(whereClause)
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(cargo)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async findById(id: string) {
    const result = await db.select().from(cargo).where(eq(cargo.id, id)).limit(1);
    return result[0] || null;
  }
}

export const cargoRepository = new CargoRepository();
