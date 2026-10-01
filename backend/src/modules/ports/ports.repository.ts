import { eq, or } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { ports } from '../../db/schema/index.js';
import { CreatePortInput, UpdatePortInput } from './ports.types.js';

export class PortsRepository {
  async findAll() {
    return db.select().from(ports).orderBy(ports.portCode);
  }

  async findByIdOrCode(idOrCode: string) {
    const result = await db
      .select()
      .from(ports)
      .where(or(eq(ports.id, idOrCode), eq(ports.portCode, idOrCode.toUpperCase())))
      .limit(1);

    return result[0] || null;
  }

  async create(data: CreatePortInput) {
    const [created] = await db
      .insert(ports)
      .values({
        ...data,
        portCode: data.portCode.toUpperCase(),
      })
      .returning();

    return created;
  }

  async update(idOrCode: string, data: UpdatePortInput) {
    const [updated] = await db
      .update(ports)
      .set({ ...data, updatedAt: new Date() })
      .where(or(eq(ports.id, idOrCode), eq(ports.portCode, idOrCode.toUpperCase())))
      .returning();

    return updated || null;
  }
}

export const portsRepository = new PortsRepository();
