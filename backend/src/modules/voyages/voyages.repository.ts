import { eq, ilike, or, count, and } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { voyages } from '../../db/schema/index.js';
import { VoyageFilterParams } from './voyages.types.js';

export class VoyagesRepository {
  async findMany(filters: VoyageFilterParams) {
    const conditions = [];

    if (filters.status && filters.status !== 'All') {
      conditions.push(eq(voyages.status, filters.status));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(voyages.voyageNumber, `%${filters.search}%`),
          ilike(voyages.vesselName, `%${filters.search}%`),
          ilike(voyages.carrier, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(voyages)
      .where(whereClause)
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(voyages)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async findByIdOrNumber(idOrNumber: string) {
    const result = await db
      .select()
      .from(voyages)
      .where(or(eq(voyages.id, idOrNumber), eq(voyages.voyageNumber, idOrNumber)))
      .limit(1);

    return result[0] || null;
  }
}

export const voyagesRepository = new VoyagesRepository();
