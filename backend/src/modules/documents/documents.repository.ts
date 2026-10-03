import { eq, or, count, and, desc } from 'drizzle-orm';
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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const whereCondition = isUuid
      ? or(eq(documents.id, id), eq(documents.documentNumber, id))
      : eq(documents.documentNumber, id);

    const result = await db.select().from(documents).where(whereCondition).limit(1);
    return result[0] || null;
  }

  async create(data: Record<string, unknown>) {
    const [created] = await db.insert(documents).values(data as any).returning();
    return created;
  }

  async update(id: string, data: Record<string, unknown>) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const whereCondition = isUuid
      ? or(eq(documents.id, id), eq(documents.documentNumber, id))
      : eq(documents.documentNumber, id);

    const [updated] = await db
      .update(documents)
      .set({
        ...data,
        updatedAt: new Date(),
      } as any)
      .where(whereCondition)
      .returning();
    return updated || null;
  }

  async delete(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const whereCondition = isUuid
      ? or(eq(documents.id, id), eq(documents.documentNumber, id))
      : eq(documents.documentNumber, id);

    const [deleted] = await db.delete(documents).where(whereCondition).returning();
    return !!deleted;
  }
}

export const documentsRepository = new DocumentsRepository();
