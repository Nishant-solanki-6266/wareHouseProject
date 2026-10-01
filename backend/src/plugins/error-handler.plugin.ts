import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../common/errors/app-error.js';
import { env } from '../config/env.js';

export function registerErrorHandlerPlugin(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | AppError | Error, request: FastifyRequest, reply: FastifyReply) => {
    // 1. Zod Validation Errors
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return reply.status(400).send({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    // 2. Custom AppErrors (e.g. ValidationError, NotFoundError, etc.)
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message,
        errors: error.errors ?? [],
      });
    }

    // 3. Fastify Schema Validation Errors
    if ('validation' in error && error.validation) {
      return reply.status(400).send({
        success: false,
        message: error.message,
        errors: error.validation,
      });
    }

    // 4. Fastify JWT Errors
    if (error.name === 'UnauthorizedError' || (error as FastifyError).statusCode === 401) {
      return reply.status(401).send({
        success: false,
        message: error.message || 'Unauthorized access',
        errors: [],
      });
    }

    // 5. Unhandled / Server Errors
    const statusCode = (error as FastifyError).statusCode || 500;
    if (statusCode >= 500) {
      request.log.error(error);
    } else {
      request.log.warn({ statusCode, message: error.message });
    }

    const isProduction = env.NODE_ENV === 'production';
    const message = isProduction && statusCode === 500 ? 'Internal server error' : error.message;

    return reply.status(statusCode).send({
      success: false,
      message,
      errors: [],
    });
  });

  // Handle 404 for undefined routes
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply.status(404).send({
      success: false,
      message: `Route ${request.method} ${request.url} not found`,
      errors: [],
    });
  });
}
