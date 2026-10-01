import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../common/errors/app-error.js';
import { ROLES } from '../common/constants/roles.js';

/**
 * Enforces port isolation for Port Agents.
 * If the user has the 'agent' role, this middleware ensures they cannot access or modify
 * records that do not belong to their assigned destination port code.
 */
export async function enforcePortIsolation(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const user = request.user;
  if (!user) {
    throw new AppError('Unauthorized: User not authenticated', 401, true);
  }

  // Non-agents (Super Admin, Warehouse Staff, Documentation Staff) are not port-restricted
  if (user.roleKey !== ROLES.PORT_AGENT) {
    return;
  }

  const agentPortCode = user.destinationPortCode;
  if (!agentPortCode) {
    throw new AppError('Agent account is missing an assigned destination port code', 403, true);
  }

  // If request contains a port parameter or query, enforce match
  const params = request.params as Record<string, unknown> | undefined;
  const query = request.query as Record<string, unknown> | undefined;
  const body = request.body as Record<string, unknown> | undefined;

  const targetPortCode =
    (params?.destinationCode as string) ||
    (params?.portCode as string) ||
    (query?.destinationCode as string) ||
    (query?.portCode as string) ||
    (body?.destinationCode as string);

  if (targetPortCode && targetPortCode.toUpperCase() !== agentPortCode.toUpperCase()) {
    throw new AppError(
      `Access denied: Port Agent is restricted to port '${agentPortCode}' and cannot access '${targetPortCode}'`,
      403,
      true
    );
  }
}
