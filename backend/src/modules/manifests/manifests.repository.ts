import { eq, ilike, or, count, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { manifests } from '../../db/schema/index.js';
import { ManifestFilterParams } from './manifests.types.js';

export class ManifestsRepository {
  async findMany(filters: ManifestFilterParams) {
    const conditions = [];

    if (filters.status && filters.status !== 'All') {
      conditions.push(eq(manifests.status, filters.status));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(manifests.manifestNumber, `%${filters.search}%`),
          ilike(manifests.title, `%${filters.search}%`),
          ilike(manifests.vesselName, `%${filters.search}%`),
          ilike(manifests.voyageNumber, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(manifests)
      .where(whereClause)
      .orderBy(desc(manifests.createdAt))
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(manifests)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async findByIdOrNumber(idOrNumber: string) {
    const result = await db
      .select()
      .from(manifests)
      .where(or(eq(manifests.id, idOrNumber), eq(manifests.manifestNumber, idOrNumber)))
      .limit(1);

    return result[0] || null;
  }
}

export const manifestsRepository = new ManifestsRepository();
