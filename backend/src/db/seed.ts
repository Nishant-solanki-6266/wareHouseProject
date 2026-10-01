import bcrypt from 'bcryptjs';
import { db, pool, testDbConnection } from './index.js';
import { roles, ports, users, agents, settings } from './schema/index.js';
import { ROLES, ROLE_DISPLAY_NAMES } from '../common/constants/roles.js';
import { STANDARD_PORTS } from '../common/constants/ports.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

export async function seedDatabase(): Promise<void> {
  console.log('🌱 Checking PostgreSQL connection before seeding...');
  const isConnected = await testDbConnection();
  if (!isConnected) {
    throw new Error('Database connection failed. Please ensure PostgreSQL is running.');
  }

  console.log('🌱 Seeding roles...');
  for (const roleKey of Object.values(ROLES)) {
    await db
      .insert(roles)
      .values({
        roleKey,
        roleName: ROLE_DISPLAY_NAMES[roleKey],
        description: `Default system role for ${ROLE_DISPLAY_NAMES[roleKey]}`,
      })
      .onConflictDoNothing();
  }

  console.log('🌱 Seeding standard ports...');
  for (const port of STANDARD_PORTS) {
    await db
      .insert(ports)
      .values({
        portCode: port.code,
        name: port.name,
        island: port.island,
        country: port.country,
        status: 'Active',
      })
      .onConflictDoNothing();
  }


  console.log('🌱 Seeding standard workflow users with hashed passwords...');
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  const initialUsersToSeed = [
    {
      userCode: 'USR-001',
      name: 'Marcus Vance',
      email: 'marcus.vance@vicustoms.com',
      roleKey: ROLES.SUPER_ADMIN,
      department: 'Executive & Global Operations',
      passwordHash: defaultPasswordHash,
      status: 'Active',
      avatar: 'MV',
      phone: '+1 (305) 555-0100',
    },
    {
      userCode: 'USR-002',
      name: 'Sarah Jenkins',
      email: 'sarah.j@vicustoms.com',
      roleKey: ROLES.DOCUMENTATION_STAFF,
      department: 'B/L Documentation & Billing',
      passwordHash: defaultPasswordHash,
      status: 'Active',
      avatar: 'SJ',
      phone: '+1 (305) 555-0142',
    },
    {
      userCode: 'USR-003',
      name: 'Carlos Mendez',
      email: 'carlos.m@vicustoms.com',
      roleKey: ROLES.WAREHOUSE_STAFF,
      department: 'Miami CFS Warehouse',
      passwordHash: defaultPasswordHash,
      status: 'Active',
      avatar: 'CM',
      phone: '+1 (305) 555-0188',
    },
    {
      userCode: 'USR-004',
      name: 'David Cartwright',
      email: 'operations@caribbeanexpressbahamas.com',
      roleKey: ROLES.PORT_AGENT,
      department: 'Caribbean Express Freight Ltd. (Bahamas)',
      agentId: undefined,
      passwordHash: defaultPasswordHash,
      status: 'Active',
      avatar: 'DC',
      phone: '+1 (242) 555-9000',
    },
  ];

  for (const user of initialUsersToSeed) {
    await db.insert(users).values(user).onConflictDoNothing();
  }

  console.log('🌱 Seeding initial system settings...');
  await db
    .insert(settings)
    .values({
      key: 'numberingRules',
      value: {
        warehouseReceiptPrefix: 'WR-2026-',
        warehouseReceiptStart: 3100,
        billOfLadingPrefix: 'BL-VI-2026-',
        shipmentPrefix: 'SHP-2026-',
        consolidationPrefix: 'CNS-2026-',
        manifestPrefix: 'MNF-2026-',
      },
      description: 'System-wide document and receipt numbering rules',
    })
    .onConflictDoNothing();

  console.log('✅ Database seeding finished successfully.');
}

// Allow direct execution
if (process.argv[1] === __filename) {
  seedDatabase()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Seeding failed:', err);
      await pool.end();
      process.exit(1);
    });
}
