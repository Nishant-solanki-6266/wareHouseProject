import { eq, ilike, or, count, and } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { customers } from '../../db/schema/index.js';
import { CustomerFilterParams, CreateCustomerInput, UpdateCustomerInput } from './customers.types.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CustomersRepository {
  async findMany(filters: CustomerFilterParams) {
    const conditions = [];

    if (filters.destinationCode && filters.destinationCode !== 'All') {
      conditions.push(eq(customers.destinationCode, filters.destinationCode));
    }
    if (filters.status && filters.status !== 'All') {
      conditions.push(eq(customers.status, filters.status));
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      conditions.push(
        or(
          ilike(customers.name, `%${q}%`),
          ilike(customers.companyName, `%${q}%`),
          ilike(customers.customerNumber, `%${q}%`),
          ilike(customers.destinationPort, `%${q}%`),
          ilike(customers.contactPerson, `%${q}%`),
          ilike(customers.email, `%${q}%`),
          ilike(customers.telephone, `%${q}%`),
          ilike(customers.phone, `%${q}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(customers)
      .where(whereClause)
      .limit(filters.limit)
      .offset(filters.offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(customers)
      .where(whereClause);

    return { data, total: Number(total) };
  }

  async findById(id: string) {
    const whereCond = UUID_REGEX.test(id)
      ? or(eq(customers.id, id), eq(customers.customerNumber, id))
      : eq(customers.customerNumber, id);

    const result = await db
      .select()
      .from(customers)
      .where(whereCond)
      .limit(1);

    return result[0] || null;
  }

  async countTotal() {
    const [{ total }] = await db.select({ total: count() }).from(customers);
    return Number(total);
  }

  async getNextCustomerNumber(): Promise<string> {
    const list = await db.select({ customerNumber: customers.customerNumber }).from(customers);
    let maxSeq = 0;
    for (const item of list) {
      const match = item.customerNumber?.match(/CUS-(\d{4})-(\d+)/);
      if (match) {
        const seq = parseInt(match[2], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    }
    const nextSeq = maxSeq + 1;
    return `CUS-2026-${String(nextSeq).padStart(4, '0')}`;
  }

  async create(data: CreateCustomerInput & { customerNumber: string; createdDate: string }) {
    const [created] = await db
      .insert(customers)
      .values(data)
      .returning();

    return created;
  }

  async update(id: string, data: UpdateCustomerInput) {
    const whereCond = UUID_REGEX.test(id)
      ? or(eq(customers.id, id), eq(customers.customerNumber, id))
      : eq(customers.customerNumber, id);

    const [updated] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(whereCond)
      .returning();

    return updated || null;
  }

  async delete(id: string) {
    const whereCond = UUID_REGEX.test(id)
      ? or(eq(customers.id, id), eq(customers.customerNumber, id))
      : eq(customers.customerNumber, id);

    const [deleted] = await db
      .delete(customers)
      .where(whereCond)
      .returning();

    return !!deleted;
  }
}

export const customersRepository = new CustomersRepository();
