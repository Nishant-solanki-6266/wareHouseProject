import { eq, or } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { agents } from '../../db/schema/index.js';
import { CreateAgentInput, UpdateAgentInput } from './agents.types.js';

export class AgentsRepository {
  async findAll() {
    return db.select().from(agents).orderBy(agents.agentCode);
  }

  async findByIdOrCode(idOrCode: string) {
    const result = await db
      .select()
      .from(agents)
      .where(or(eq(agents.id, idOrCode), eq(agents.agentCode, idOrCode)))
      .limit(1);

    return result[0] || null;
  }

  async create(data: CreateAgentInput) {
    const [created] = await db.insert(agents).values(data).returning();
    return created;
  }

  async update(idOrCode: string, data: UpdateAgentInput) {
    const [updated] = await db
      .update(agents)
      .set({ ...data, updatedAt: new Date() })
      .where(or(eq(agents.id, idOrCode), eq(agents.agentCode, idOrCode)))
      .returning();

    return updated || null;
  }
}

export const agentsRepository = new AgentsRepository();
