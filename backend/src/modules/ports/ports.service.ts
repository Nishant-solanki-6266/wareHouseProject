import { PortsRepository, portsRepository } from './ports.repository.js';
import { CreatePortInput, UpdatePortInput } from './ports.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';

export class PortsService {
  constructor(private readonly repo: PortsRepository = portsRepository) {}

  async listPorts() {
    return this.repo.findAll();
  }

  async getPort(idOrCode: string) {
    const port = await this.repo.findByIdOrCode(idOrCode);
    if (!port) throw new NotFoundError('Port');
    return port;
  }

  async createPort(input: CreatePortInput) {
    return this.repo.create(input);
  }

  async updatePort(idOrCode: string, input: UpdatePortInput) {
    await this.getPort(idOrCode);
    return this.repo.update(idOrCode, input);
  }

  async deletePort(idOrCode: string) {
    await this.getPort(idOrCode);
    return this.repo.delete(idOrCode);
  }
}

export const portsService = new PortsService();
