import { eq, or } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { agents } from '../../db/schema/index.js';
import { CreateAgentInput, UpdateAgentInput } from './agents.types.js';

export class AgentsRepository {
  async findAll() {
    return db.select().from(agents).orderBy(agents.agentCode);
  }

  async findByIdOrCode(idOrCode: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrCode);
    const whereCondition = isUuid
      ? or(eq(agents.id, idOrCode), eq(agents.agentCode, idOrCode))
      : eq(agents.agentCode, idOrCode);

    const result = await db
      .select()
      .from(agents)
      .where(whereCondition)
      .limit(1);

    return result[0] || null;
  }

  async create(data: CreateAgentInput) {
    const [created] = await db.insert(agents).values(data).returning();
    return created;
  }

  async update(idOrCode: string, data: UpdateAgentInput) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrCode);
    const whereCondition = isUuid
      ? or(eq(agents.id, idOrCode), eq(agents.agentCode, idOrCode))
      : eq(agents.agentCode, idOrCode);

    const [updated] = await db
      .update(agents)
      .set({ ...data, updatedAt: new Date() })
      .where(whereCondition)
      .returning();

    return updated || null;
  }

  async delete(idOrCode: string) {
    const [deleted] = await db
      .delete(agents)
      .where(or(eq(agents.id, idOrCode), eq(agents.agentCode, idOrCode)))
      .returning();
    return !!deleted;
  }
}


export const agentsRepository = new AgentsRepository();
