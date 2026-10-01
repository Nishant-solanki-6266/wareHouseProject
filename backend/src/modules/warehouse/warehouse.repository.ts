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
    if (filters.search) {
      conditions.push(
        or(
          ilike(warehouseReceipts.receiptNumber, `%${filters.search}%`),
          ilike(warehouseReceipts.customerName, `%${filters.search}%`),
          ilike(warehouseReceipts.consignee, `%${filters.search}%`),
          ilike(warehouseReceipts.cargoDescription, `%${filters.search}%`),
          ilike(warehouseReceipts.destinationPort, `%${filters.search}%`)
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
    const result = await db
      .select()
      .from(warehouseReceipts)
      .where(
        or(
          eq(warehouseReceipts.id, idOrReceiptNumber),
          eq(warehouseReceipts.receiptNumber, idOrReceiptNumber)
        )
      )
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
    if (data.lengthInches !== undefined) updateValues.lengthInches = String(data.lengthInches);
    if (data.widthInches !== undefined) updateValues.widthInches = String(data.widthInches);
    if (data.heightInches !== undefined) updateValues.heightInches = String(data.heightInches);
    if (data.weightLbs !== undefined) updateValues.weightLbs = String(data.weightLbs);

    const [updated] = await db
      .update(warehouseReceipts)
      .set(updateValues)
      .where(or(eq(warehouseReceipts.id, id), eq(warehouseReceipts.receiptNumber, id)))
      .returning();

    return updated || null;
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(warehouseReceipts)
      .where(or(eq(warehouseReceipts.id, id), eq(warehouseReceipts.receiptNumber, id)))
      .returning();

    return !!deleted;
  }
}

export const warehouseRepository = new WarehouseRepository();
