import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService, authService } from './auth.service.js';
import { loginSchema } from './auth.schema.js';
import { successResponse } from '../../common/utils/response.js';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const validatedBody = loginSchema.parse(request.body);
    const user = await this.service.validateCredentials(validatedBody);

    const token = request.server.jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      roleKey: user.roleKey,
      agentId: user.agentId,
      destinationPortCode: user.destinationPortCode,
    });

    reply.send(
      successResponse(
        {
          token,
          user,
        },
        'Login successful'
      )
    );
  };

  me = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const currentUserId = request.user.id;
    const user = await this.service.getMe(currentUserId);
    reply.send(successResponse(user));
  };
}

export const authController = new AuthController();
