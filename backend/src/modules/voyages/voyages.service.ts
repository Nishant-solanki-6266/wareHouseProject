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
}

export const voyagesService = new VoyagesService();
