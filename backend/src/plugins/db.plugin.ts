import { FastifyInstance } from 'fastify';
import { db, pool } from '../db/index.js';

export async function registerDbPlugin(app: FastifyInstance): Promise<void> {
  app.decorate('db', db);

  app.addHook('onClose', async () => {
    app.log.info('Closing PostgreSQL connection pool...');
    await pool.end();
  });
}
