import { eq, or } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { ports } from '../../db/schema/index.js';
import { CreatePortInput, UpdatePortInput } from './ports.types.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class PortsRepository {
  async findAll() {
    return db.select().from(ports).orderBy(ports.portCode);
  }

  async findByIdOrCode(idOrCode: string) {
    const isUuid = UUID_REGEX.test(idOrCode);
    const code = idOrCode.replace(/^PORT-/, '').toUpperCase();
    const condition = isUuid
      ? or(eq(ports.id, idOrCode), eq(ports.portCode, idOrCode.toUpperCase()), eq(ports.portCode, code))
      : or(eq(ports.portCode, idOrCode.toUpperCase()), eq(ports.portCode, code));

    const result = await db
      .select()
      .from(ports)
      .where(condition)
      .limit(1);

    return result[0] || null;
  }

  async create(data: CreatePortInput) {
    const [created] = await db
      .insert(ports)
      .values({
        ...data,
        portCode: data.portCode.toUpperCase(),
        status: data.status || 'Active',
      })
      .onConflictDoUpdate({
        target: ports.portCode,
        set: {
          name: data.name,
          island: data.island,
          country: data.country,
          status: data.status || 'Active',
          defaultAgent: data.defaultAgent,
          updatedAt: new Date(),
        }
      })
      .returning();

    return created;
  }

  async update(idOrCode: string, data: UpdatePortInput) {
    const isUuid = UUID_REGEX.test(idOrCode);
    const code = idOrCode.replace(/^PORT-/, '').toUpperCase();
    const condition = isUuid
      ? or(eq(ports.id, idOrCode), eq(ports.portCode, idOrCode.toUpperCase()), eq(ports.portCode, code))
      : or(eq(ports.portCode, idOrCode.toUpperCase()), eq(ports.portCode, code));

    const [updated] = await db
      .update(ports)
      .set({ ...data, updatedAt: new Date() })
      .where(condition)
      .returning();

    return updated || null;
  }

  async delete(idOrCode: string) {
    const isUuid = UUID_REGEX.test(idOrCode);
    const code = idOrCode.replace(/^PORT-/, '').toUpperCase();
    const condition = isUuid
      ? or(eq(ports.id, idOrCode), eq(ports.portCode, idOrCode.toUpperCase()), eq(ports.portCode, code))
      : or(eq(ports.portCode, idOrCode.toUpperCase()), eq(ports.portCode, code));

    const [deleted] = await db
      .delete(ports)
      .where(condition)
      .returning();

    return deleted || null;
  }
}

export const portsRepository = new PortsRepository();
