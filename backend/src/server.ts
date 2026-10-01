import { buildApp } from './app.js';
import { env } from './config/env.js';

async function startServer(): Promise<void> {
  const app = await buildApp();

  try {
    const address = await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    app.log.info(`VI Customs Brokers & Logistics API server listening at: ${address}`);
    app.log.info(`Health check: ${address}/health`);
    app.log.info(`API v1 root: ${address}/api/v1/health`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown handling
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}. Gracefully terminating server...`);
      try {
        await app.close();
        app.log.info('Server successfully closed.');
        process.exit(0);
      } catch (closeErr) {
        app.log.error(closeErr);
        process.exit(1);
      }
    });
  }
}

startServer();
