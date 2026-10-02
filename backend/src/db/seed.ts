import bcrypt from 'bcryptjs';
import { db, pool, testDbConnection } from './index.js';
import {
  roles,
  ports,
  users,
  agents,
  settings,
} from './schema/index.js';
import { ROLES, ROLE_DISPLAY_NAMES } from '../common/constants/roles.js';
import { STANDARD_PORTS } from '../common/constants/ports.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

export async function seedDatabase(): Promise<void> {
  console.log('🌱 Checking PostgreSQL connection before seeding...');
  const isConnected = await testDbConnection();
  if (!isConnected.connected) {
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

  console.log('🌱 Seeding destination port agents...');
  const [caribbeanAgent] = await db
    .insert(agents)
    .values({
      agentCode: 'AGT-001',
      name: 'Caribbean Express Freight Ltd.',
      contactPerson: 'David Cartwright',
      email: 'operations@caribbeanexpressbahamas.com',
      phone: '+1 (242) 555-9000',
      territory: 'Nassau & Freeport (Bahamas)',
      address: 'Arawak Cay Port Terminal, Nassau, Bahamas',
      assignedPortCode: 'NAS',
      status: 'Active',
      rating: '5.0/5',
      creditLimitUsd: '50000.00',
      currentBalanceUsd: '0.00',
      lastActivity: 'Active Inbound Handling',
    })
    .onConflictDoUpdate({
      target: agents.agentCode,
      set: {
        name: 'Caribbean Express Freight Ltd.',
        assignedPortCode: 'NAS',
        status: 'Active',
      },
    })
    .returning();

  await db
    .insert(agents)
    .values({
      agentCode: 'AGT-002',
      name: 'Antilles Cargo Agency',
      contactPerson: 'Leighton Forbes',
      email: 'dispatch@antillesagent.com',
      phone: '+1 (876) 555-0199',
      territory: 'Kingston (Jamaica)',
      address: 'Kingston Wharves Berth 5, Jamaica',
      assignedPortCode: 'KIN',
      status: 'Active',
      rating: '4.8/5',
      creditLimitUsd: '40000.00',
      currentBalanceUsd: '0.00',
      lastActivity: 'Port Clearance Operations',
    })
    .onConflictDoNothing();

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
      agentId: null,
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
      agentId: null,
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
      agentId: null,
    },
    {
      userCode: 'USR-004',
      name: 'David Cartwright',
      email: 'operations@caribbeanexpressbahamas.com',
      roleKey: ROLES.PORT_AGENT,
      department: 'Caribbean Express Freight Ltd. (Bahamas)',
      agentId: caribbeanAgent.id,
      passwordHash: defaultPasswordHash,
      status: 'Active',
      avatar: 'DC',
      phone: '+1 (242) 555-9000',
    },
  ];

  for (const user of initialUsersToSeed) {
    await db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          roleKey: user.roleKey,
          agentId: user.agentId,
          name: user.name,
          department: user.department,
          status: user.status,
          passwordHash: user.passwordHash,
        },
      });
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

  console.log('✅ Master system setup finished successfully (Blank-slate transactional dataset).');
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
