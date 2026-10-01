import { AgentsRepository, agentsRepository } from './agents.repository.js';
import { CreateAgentInput, UpdateAgentInput } from './agents.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';

export class AgentsService {
  constructor(private readonly repo: AgentsRepository = agentsRepository) {}

  async listAgents() {
    return this.repo.findAll();
  }

  async getAgent(idOrCode: string) {
    const agent = await this.repo.findByIdOrCode(idOrCode);
    if (!agent) throw new NotFoundError('Agent');
    return agent;
  }

  async createAgent(input: CreateAgentInput) {
    return this.repo.create(input);
  }

  async updateAgent(idOrCode: string, input: UpdateAgentInput) {
    await this.getAgent(idOrCode);
    return this.repo.update(idOrCode, input);
  }
}

export const agentsService = new AgentsService();
