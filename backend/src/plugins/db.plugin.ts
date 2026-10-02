import { FastifyInstance } from 'fastify';
import { db, pool, testDbConnection } from '../db/index.js';

export async function registerDbPlugin(app: FastifyInstance): Promise<void> {
  app.decorate('db', db);

  const isConnected = await testDbConnection();
  if (isConnected) {
    app.log.info('PostgreSQL database connected successfully (Database: Warhouse)');
  } else {
    app.log.error('PostgreSQL database connection failed!');
  }

  app.addHook('onClose', async () => {
    app.log.info('Closing PostgreSQL connection pool...');
    await pool.end();
  });
}
