import { eq, ilike, or, count, and } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { vessels } from '../../db/schema/index.js';
import { VesselFilterParams } from './vessels.types.js';

export class VesselsRepository {
  async findMany(filters: VesselFilterParams) {
    const conditions = [];

    if (filters.status && filters.status !== 'All') {
      conditions.push(eq(vessels.status, filters.status));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(vessels.name, `%${filters.search}%`),
          ilike(vessels.imoNumber, `%${filters.search}%`),
          ilike(vessels.carrier, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(vessels)
      .where(whereClause)
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(vessels)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async findById(id: string) {
    const result = await db.select().from(vessels).where(eq(vessels.id, id)).limit(1);
    return result[0] || null;
  }
}

export const vesselsRepository = new VesselsRepository();
