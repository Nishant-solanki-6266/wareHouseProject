import { ContainersRepository, containersRepository } from './containers.repository.js';
import { ContainerFilterParams } from './containers.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';

export class ContainersService {
  constructor(private readonly repo: ContainersRepository = containersRepository) {}

  async listContainers(filters: ContainerFilterParams) {
    return this.repo.findMany(filters);
  }

  async getContainer(idOrNumber: string) {
    const item = await this.repo.findByIdOrNumber(idOrNumber);
    if (!item) throw new NotFoundError('Container');
    return item;
  }

  async createContainer(input: Record<string, unknown>) {
    return this.repo.create(input);
  }

  async updateContainer(idOrNumber: string, input: Record<string, unknown>) {
    await this.getContainer(idOrNumber);
    return this.repo.update(idOrNumber, input);
  }

  async deleteContainer(idOrNumber: string) {
    await this.getContainer(idOrNumber);
    return this.repo.delete(idOrNumber);
  }
}


export const containersService = new ContainersService();
