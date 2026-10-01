import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { testDbConnection } from '../db/client.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  // Application general liveness check
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      success: true,
      message: 'VI Customs Brokers & Logistics API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Database connectivity readiness check
  app.get('/db', async (_request: FastifyRequest, reply: FastifyReply) => {
    const isDbConnected = await testDbConnection();

    if (!isDbConnected) {
      return reply.status(503).send({
        success: false,
        message: 'PostgreSQL connection failed or unavailable',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }

    reply.send({
      success: true,
      message: 'PostgreSQL database connected and healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  });
}
