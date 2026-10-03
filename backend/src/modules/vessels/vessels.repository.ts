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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid
      ? or(eq(vessels.id, id), eq(vessels.imoNumber, id))
      : eq(vessels.imoNumber, id);
    const result = await db.select().from(vessels).where(condition).limit(1);
    return result[0] || null;
  }

  async create(data: Record<string, unknown>) {
    const isUuid = typeof data.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id);
    const insertData: any = { ...data };
    if (!isUuid) delete insertData.id;
    delete insertData.lengthFeet;
    if (insertData.capacityTeu !== undefined) insertData.capacityTeu = Number(insertData.capacityTeu);
    if (insertData.deadweightTonnage !== undefined) insertData.deadweightTonnage = Number(insertData.deadweightTonnage);
    if (insertData.builtYear !== undefined) insertData.builtYear = Number(insertData.builtYear);

    const [created] = await db.insert(vessels).values(insertData).returning();
    return created;
  }

  async update(id: string, data: Record<string, unknown>) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid
      ? or(eq(vessels.id, id), eq(vessels.imoNumber, id))
      : eq(vessels.imoNumber, id);

    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    delete updateData.id;
    delete updateData.lengthFeet;
    if (updateData.capacityTeu !== undefined) updateData.capacityTeu = Number(updateData.capacityTeu);
    if (updateData.deadweightTonnage !== undefined) updateData.deadweightTonnage = Number(updateData.deadweightTonnage);
    if (updateData.builtYear !== undefined) updateData.builtYear = Number(updateData.builtYear);

    const [updated] = await db.update(vessels).set(updateData).where(condition).returning();
    return updated || null;
  }

  async delete(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid
      ? or(eq(vessels.id, id), eq(vessels.imoNumber, id))
      : eq(vessels.imoNumber, id);

    const [deleted] = await db.delete(vessels).where(condition).returning();
    return !!deleted;
  }
}


export const vesselsRepository = new VesselsRepository();
