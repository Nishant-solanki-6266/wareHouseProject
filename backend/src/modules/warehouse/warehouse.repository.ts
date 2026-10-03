import { eq, ilike, or, count, and, desc, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { warehouseReceipts, NewWarehouseReceipt } from '../../db/schema/index.js';
import { WarehouseReceiptFilterParams, UpdateWarehouseReceiptInput } from './warehouse.types.js';

export class WarehouseRepository {
  async findMany(filters: WarehouseReceiptFilterParams) {
    const conditions = [];

    if (filters.status && filters.status !== 'All') {
      conditions.push(eq(warehouseReceipts.status, filters.status));
    }
    if (filters.destinationCode && filters.destinationCode !== 'All') {
      conditions.push(eq(warehouseReceipts.destinationCode, filters.destinationCode));
    }
    if (filters.customerId && filters.customerId !== 'All') {
      conditions.push(eq(warehouseReceipts.customerId, filters.customerId));
    }
    if (filters.agentId && filters.agentId !== 'All') {
      conditions.push(eq(warehouseReceipts.agentId, filters.agentId));
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      conditions.push(
        or(
          ilike(warehouseReceipts.receiptNumber, `%${q}%`),
          ilike(warehouseReceipts.customerName, `%${q}%`),
          ilike(warehouseReceipts.shipper, `%${q}%`),
          ilike(warehouseReceipts.consignee, `%${q}%`),
          ilike(warehouseReceipts.cargoDescription, `%${q}%`),
          ilike(warehouseReceipts.destinationPort, `%${q}%`),
          ilike(warehouseReceipts.destinationCode, `%${q}%`),
          sql`${warehouseReceipts.packages}::text ILIKE ${'%' + q + '%'}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(warehouseReceipts)
      .where(whereClause)
      .orderBy(desc(warehouseReceipts.sequenceNumber))
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(warehouseReceipts)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async findByIdOrReceiptNumber(idOrReceiptNumber: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrReceiptNumber);
    const condition = isUuid
      ? or(eq(warehouseReceipts.id, idOrReceiptNumber), eq(warehouseReceipts.receiptNumber, idOrReceiptNumber))
      : eq(warehouseReceipts.receiptNumber, idOrReceiptNumber);

    const result = await db
      .select()
      .from(warehouseReceipts)
      .where(condition)
      .limit(1);

    return result[0] || null;
  }

  async getNextSequenceNumber(): Promise<number> {
    const [row] = await db
      .select({ maxSeq: sql<number>`COALESCE(MAX(${warehouseReceipts.sequenceNumber}), 3099)` })
      .from(warehouseReceipts);

    const max = Number(row?.maxSeq) || 3099;
    return Math.max(3100, max + 1);
  }

  async create(data: NewWarehouseReceipt) {
    const [created] = await db.insert(warehouseReceipts).values(data).returning();
    return created;
  }

  async update(id: string, data: UpdateWarehouseReceiptInput) {
    const updateValues: Record<string, unknown> = {
      ...data,
      updatedAt: new Date(),
    };
    if (data.customer || data.customerName) {
      updateValues.customerName = data.customerName || data.customer;
    }
    delete updateValues.customer;
    delete updateValues.cft;
    delete updateValues.cbm;

    if (data.lengthInches !== undefined && data.lengthInches !== null) updateValues.lengthInches = String(data.lengthInches);
    if (data.widthInches !== undefined && data.widthInches !== null) updateValues.widthInches = String(data.widthInches);
    if (data.heightInches !== undefined && data.heightInches !== null) updateValues.heightInches = String(data.heightInches);
    if (data.weightLbs !== undefined && data.weightLbs !== null) updateValues.weightLbs = String(data.weightLbs);
    if (data.weightKg !== undefined && data.weightKg !== null) updateValues.weightKg = String(data.weightKg);
    if (data.totalCft !== undefined && data.totalCft !== null) updateValues.totalCft = String(data.totalCft);
    else if ((data as any).cft !== undefined && (data as any).cft !== null) updateValues.totalCft = String((data as any).cft);
    if (data.totalCbm !== undefined && data.totalCbm !== null) updateValues.totalCbm = String(data.totalCbm);
    else if ((data as any).cbm !== undefined && (data as any).cbm !== null) updateValues.totalCbm = String((data as any).cbm);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid
      ? or(eq(warehouseReceipts.id, id), eq(warehouseReceipts.receiptNumber, id))
      : eq(warehouseReceipts.receiptNumber, id);

    const [updated] = await db
      .update(warehouseReceipts)
      .set(updateValues)
      .where(condition)
      .returning();

    return updated || null;
  }

  async delete(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid
      ? or(eq(warehouseReceipts.id, id), eq(warehouseReceipts.receiptNumber, id))
      : eq(warehouseReceipts.receiptNumber, id);

    const [deleted] = await db
      .delete(warehouseReceipts)
      .where(condition)
      .returning();

    return !!deleted;
  }
}


export const warehouseRepository = new WarehouseRepository();
