import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { settings } from '../../db/schema/index.js';

export class SettingsRepository {
  async findAll() {
    return db.select().from(settings);
  }

  async findByKey(key: string) {
    const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return result[0] || null;
  }

  async upsert(key: string, value: Record<string, unknown>, description?: string) {
    const [saved] = await db
      .insert(settings)
      .values({ key, value, description })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, description, updatedAt: new Date() },
      })
      .returning();

    return saved;
  }

  async cleanSlate() {
    try {
      await db.execute(sql`TRUNCATE TABLE shipments, audit_logs RESTART IDENTITY CASCADE;`);
    } catch {
      try {
        await db.execute(sql`DELETE FROM shipments;`);
      } catch {}
      try {
        await db.execute(sql`DELETE FROM audit_logs;`);
      } catch {}
    }
    return true;
  }
}

export const settingsRepository = new SettingsRepository();
