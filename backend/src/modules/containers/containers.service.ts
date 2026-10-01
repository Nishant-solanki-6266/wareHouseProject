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
}

export const containersService = new ContainersService();
