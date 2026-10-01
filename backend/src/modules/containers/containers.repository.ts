import { eq, ilike, or, count, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { containers } from '../../db/schema/index.js';
import { ContainerFilterParams } from './containers.types.js';

export class ContainersRepository {
  async findMany(filters: ContainerFilterParams) {
    const conditions = [];

    if (filters.status && filters.status !== 'All') {
      conditions.push(eq(containers.status, filters.status));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(containers.containerNumber, `%${filters.search}%`),
          ilike(containers.carrier, `%${filters.search}%`),
          ilike(containers.sealNumber, `%${filters.search}%`),
          ilike(containers.location, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(containers)
      .where(whereClause)
      .orderBy(desc(containers.createdAt))
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(containers)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async findByIdOrNumber(idOrNumber: string) {
    const result = await db
      .select()
      .from(containers)
      .where(or(eq(containers.id, idOrNumber), eq(containers.containerNumber, idOrNumber)))
      .limit(1);

    return result[0] || null;
  }
}

export const containersRepository = new ContainersRepository();
