import bcrypt from 'bcryptjs';
import { db, pool } from './index.js';
import { users, roles } from './schema/index.js';
import { eq } from 'drizzle-orm';

async function syncPersonas() {
  console.log('🔄 Syncing 5 personas and roles...');
  const hash = await bcrypt.hash('password123', 10);

  // 1. Ensure warehouse role exists
  await db.insert(roles).values({
    roleKey: 'warehouse',
    roleName: 'Warehouse Staff',
    description: 'Miami CFS Warehouse Intake',
  }).onConflictDoNothing();

  // 2. Ensure operations role exists
  await db.insert(roles).values({
    roleKey: 'operations',
    roleName: 'Operations Coordinator',
    description: 'Vessel Operations & Consolidations',
  }).onConflictDoNothing();

  // 3. Update all users' password hash to password123
  await db.update(users).set({ passwordHash: hash });

  // 4. Update Carlos to warehouse role
  await db.update(users).set({ roleKey: 'warehouse' }).where(eq(users.email, 'carlos.m@vicustoms.com'));

  // 5. Update Elena to operations role
  await db.update(users).set({ roleKey: 'operations' }).where(eq(users.email, 'elena.r@vicustoms.com'));

  console.log('✅ Personas synchronized successfully.');
  await pool.end();
}

syncPersonas().catch(err => {
  console.error('Failed to sync personas:', err);
  process.exit(1);
});
