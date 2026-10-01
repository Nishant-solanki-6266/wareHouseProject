import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../common/errors/app-error.js';
import { RoleType, ROLES } from '../common/constants/roles.js';

/**
 * Creates a route preHandler middleware that restricts access to the specified roles.
 * Super Admin always has full access.
 */
export function requireRole(...allowedRoles: RoleType[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new AppError('Unauthorized: User not authenticated', 401, true);
    }

    const userRole = request.user.roleKey;

    // Super Admin bypasses role checks
    if (userRole === ROLES.SUPER_ADMIN) {
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      throw new AppError(
        `Forbidden: Role '${userRole}' does not have sufficient permissions to perform this action`,
        403,
        true
      );
    }
  };
}
