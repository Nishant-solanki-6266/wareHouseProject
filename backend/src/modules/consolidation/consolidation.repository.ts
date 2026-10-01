import { eq, ilike, or, count, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { consolidations } from '../../db/schema/index.js';
import { ConsolidationFilterParams } from './consolidation.types.js';

export class ConsolidationRepository {
  async findMany(filters: ConsolidationFilterParams) {
    const conditions = [];

    if (filters.status && filters.status !== 'All') {
      conditions.push(eq(consolidations.status, filters.status));
    }
    if (filters.destinationCode && filters.destinationCode !== 'All') {
      conditions.push(eq(consolidations.destinationCode, filters.destinationCode));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(consolidations.consolidationNumber, `%${filters.search}%`),
          ilike(consolidations.title, `%${filters.search}%`),
          ilike(consolidations.containerNumber, `%${filters.search}%`),
          ilike(consolidations.vesselName, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(consolidations)
      .where(whereClause)
      .orderBy(desc(consolidations.createdAt))
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(consolidations)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async findByIdOrNumber(idOrNumber: string) {
    const result = await db
      .select()
      .from(consolidations)
      .where(or(eq(consolidations.id, idOrNumber), eq(consolidations.consolidationNumber, idOrNumber)))
      .limit(1);

    return result[0] || null;
  }
}

export const consolidationRepository = new ConsolidationRepository();
