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

  async create(data: Record<string, unknown>) {
    const isUuid = typeof data.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id);
    const insertData: any = { ...data };
    if (!isUuid) delete insertData.id;
    if (insertData.tareWeightKg !== undefined) insertData.tareWeightKg = String(insertData.tareWeightKg);
    if (insertData.maxPayloadKg !== undefined) insertData.maxPayloadKg = String(insertData.maxPayloadKg);
    if (insertData.maxVolumeCbm !== undefined) insertData.maxVolumeCbm = String(insertData.maxVolumeCbm);
    if (insertData.loadedWeightKg !== undefined) insertData.loadedWeightKg = String(insertData.loadedWeightKg);
    if (insertData.loadedVolumeCbm !== undefined) insertData.loadedVolumeCbm = String(insertData.loadedVolumeCbm);
    if (insertData.fillPercentage !== undefined) insertData.fillPercentage = String(insertData.fillPercentage);

    const [created] = await db.insert(containers).values(insertData).returning();
    return created;
  }

  async update(idOrNumber: string, data: Record<string, unknown>) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
    const condition = isUuid
      ? or(eq(containers.id, idOrNumber), eq(containers.containerNumber, idOrNumber))
      : eq(containers.containerNumber, idOrNumber);

    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    delete updateData.id;
    if (updateData.tareWeightKg !== undefined) updateData.tareWeightKg = String(updateData.tareWeightKg);
    if (updateData.maxPayloadKg !== undefined) updateData.maxPayloadKg = String(updateData.maxPayloadKg);
    if (updateData.maxVolumeCbm !== undefined) updateData.maxVolumeCbm = String(updateData.maxVolumeCbm);
    if (updateData.loadedWeightKg !== undefined) updateData.loadedWeightKg = String(updateData.loadedWeightKg);
    if (updateData.loadedVolumeCbm !== undefined) updateData.loadedVolumeCbm = String(updateData.loadedVolumeCbm);
    if (updateData.fillPercentage !== undefined) updateData.fillPercentage = String(updateData.fillPercentage);

    const [updated] = await db.update(containers).set(updateData).where(condition).returning();
    return updated || null;
  }

  async delete(idOrNumber: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
    const condition = isUuid
      ? or(eq(containers.id, idOrNumber), eq(containers.containerNumber, idOrNumber))
      : eq(containers.containerNumber, idOrNumber);

    const [deleted] = await db.delete(containers).where(condition).returning();
    return !!deleted;
  }
}


export const containersRepository = new ContainersRepository();
