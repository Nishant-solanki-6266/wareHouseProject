import { eq, ilike, or, count, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { auditLogs, NewAuditLog } from '../../db/schema/index.js';
import { AuditLogFilterParams } from './audit.types.js';

export class AuditRepository {
  async findMany(filters: AuditLogFilterParams) {
    const conditions = [];

    if (filters.module) {
      conditions.push(eq(auditLogs.module, filters.module));
    }
    if (filters.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(auditLogs.logNumber, `%${filters.search}%`),
          ilike(auditLogs.userName, `%${filters.search}%`),
          ilike(auditLogs.action, `%${filters.search}%`),
          ilike(auditLogs.recordId, `%${filters.search}%`),
          ilike(auditLogs.description, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(auditLogs)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async countTotal() {
    const [{ total }] = await db.select({ total: count() }).from(auditLogs);
    return Number(total);
  }

  async create(data: NewAuditLog) {
    const [created] = await db.insert(auditLogs).values(data).returning();
    return created;
  }
}

export const auditRepository = new AuditRepository();
