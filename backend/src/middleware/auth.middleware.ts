import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../common/errors/app-error.js';
import { JwtUserPayload } from '../common/types/auth.types.js';

export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  try {
    const decoded = await request.jwtVerify<JwtUserPayload>();
    request.user = decoded;
  } catch (err) {
    throw new AppError('Authentication required. Invalid or expired token.', 401, true);
  }
}
