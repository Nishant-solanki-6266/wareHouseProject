import { eq, count, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { documents } from '../../db/schema/index.js';
import { DocumentFilterParams } from './documents.types.js';

export class DocumentsRepository {
  async findMany(filters: DocumentFilterParams) {
    const conditions = [];

    if (filters.entityType) {
      conditions.push(eq(documents.entityType, filters.entityType));
    }
    if (filters.entityId) {
      conditions.push(eq(documents.entityId, filters.entityId));
    }
    if (filters.documentType) {
      conditions.push(eq(documents.documentType, filters.documentType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(documents)
      .where(whereClause)
      .orderBy(desc(documents.createdAt))
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(documents)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async findById(id: string) {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0] || null;
  }
}

export const documentsRepository = new DocumentsRepository();
