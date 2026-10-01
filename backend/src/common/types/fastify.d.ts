import { JwtUserPayload } from './auth.types.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtUserPayload;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtUserPayload;
    user: JwtUserPayload;
  }
}
