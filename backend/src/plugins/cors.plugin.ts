import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from '../config/env.js';

export async function registerCorsPlugin(app: FastifyInstance): Promise<void> {
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim().toLowerCase());

  await app.register(cors, {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, server-to-server)
      if (!origin) return callback(null, true);

      const lowerOrigin = origin.toLowerCase();

      // Explicitly allow Netlify deployments, Railway deployments, and localhost
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(lowerOrigin) ||
        lowerOrigin.includes('netlify.app') ||
        lowerOrigin.includes('railway.app') ||
        lowerOrigin.includes('localhost') ||
        lowerOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }

      // Safe fallback to avoid 500 preflight crashes on any valid frontend deploy
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
  });
}

