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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
    const condition = isUuid
      ? or(eq(consolidations.id, idOrNumber), eq(consolidations.consolidationNumber, idOrNumber))
      : eq(consolidations.consolidationNumber, idOrNumber);

    const result = await db
      .select()
      .from(consolidations)
      .where(condition)
      .limit(1);

    return result[0] || null;
  }

  async countTotal(): Promise<number> {
    const [{ total }] = await db.select({ total: count() }).from(consolidations);
    return Number(total);
  }

  async create(data: Record<string, unknown> | any) {
    const [created] = await db.insert(consolidations).values(data as any).returning();
    return created;
  }

  async update(id: string, data: Record<string, unknown>) {
    const [updated] = await db
      .update(consolidations)
      .set({
        ...data,
        updatedAt: new Date(),
      } as any)
      .where(or(eq(consolidations.id, id), eq(consolidations.consolidationNumber, id)))
      .returning();
    return updated || null;
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(consolidations)
      .where(or(eq(consolidations.id, id), eq(consolidations.consolidationNumber, id)))
      .returning();
    return !!deleted;
  }
}

export const consolidationRepository = new ConsolidationRepository();

