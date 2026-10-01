import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users, agents } from '../../db/schema/index.js';

export class AuthRepository {
  async findUserByEmail(email: string) {
    const result = await db
      .select({
        id: users.id,
        userCode: users.userCode,
        name: users.name,
        email: users.email,
        passwordHash: users.passwordHash,
        roleKey: users.roleKey,
        department: users.department,
        status: users.status,
        avatar: users.avatar,
        agentId: users.agentId,
        assignedPortCode: agents.assignedPortCode,
      })
      .from(users)
      .leftJoin(agents, eq(users.agentId, agents.id))
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    return result[0] || null;
  }

  async findUserById(id: string) {
    const result = await db
      .select({
        id: users.id,
        userCode: users.userCode,
        name: users.name,
        email: users.email,
        roleKey: users.roleKey,
        department: users.department,
        status: users.status,
        avatar: users.avatar,
        agentId: users.agentId,
        assignedPortCode: agents.assignedPortCode,
      })
      .from(users)
      .leftJoin(agents, eq(users.agentId, agents.id))
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }
}

export const authRepository = new AuthRepository();
