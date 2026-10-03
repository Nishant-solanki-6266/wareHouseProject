import { VoyagesRepository, voyagesRepository } from './voyages.repository.js';
import { VoyageFilterParams } from './voyages.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';

export class VoyagesService {
  constructor(private readonly repo: VoyagesRepository = voyagesRepository) {}

  async listVoyages(filters: VoyageFilterParams) {
    return this.repo.findMany(filters);
  }

  async getVoyage(idOrNumber: string) {
    const item = await this.repo.findByIdOrNumber(idOrNumber);
    if (!item) throw new NotFoundError('Voyage');
    return item;
  }

  async createVoyage(data: Record<string, unknown>) {
    return this.repo.create(data);
  }

  async updateVoyage(id: string, data: Record<string, unknown>) {
    const updated = await this.repo.update(id, data);
    if (!updated) throw new NotFoundError('Voyage');
    return updated;
  }

  async deleteVoyage(id: string) {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundError('Voyage');
    return true;
  }
}

export const voyagesService = new VoyagesService();
