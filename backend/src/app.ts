import fastify, { FastifyInstance } from 'fastify';
import { env } from './config/env.js';
import { registerCorsPlugin } from './plugins/cors.plugin.js';
import { registerJwtPlugin } from './plugins/jwt.plugin.js';
import { registerDbPlugin } from './plugins/db.plugin.js';
import { registerErrorHandlerPlugin } from './plugins/error-handler.plugin.js';
import { registerAppRoutes } from './routes/index.js';

export async function buildApp(): Promise<FastifyInstance> {
  const isDev = env.NODE_ENV === 'development';

  const app = fastify({
    logger: isDev
      ? {
          level: 'info',
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname,reqId',
              singleLine: true,
            },
          },
        }
      : {
          level: 'info',
          redact: ['req.headers.authorization', 'body.password', 'DATABASE_URL', 'JWT_SECRET'],
        },
  });

  // 1. Error handling plugin
  registerErrorHandlerPlugin(app);

  // 2. Core infrastructure plugins
  await registerCorsPlugin(app);
  await registerJwtPlugin(app);
  await registerDbPlugin(app);

  // 3. Centralized route definitions
  await registerAppRoutes(app);

  return app;
}
