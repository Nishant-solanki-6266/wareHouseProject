import { ManifestsRepository, manifestsRepository } from './manifests.repository.js';
import { ManifestFilterParams } from './manifests.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';

export class ManifestsService {
  constructor(private readonly repo: ManifestsRepository = manifestsRepository) {}

  async listManifests(filters: ManifestFilterParams) {
    return this.repo.findMany(filters);
  }

  async getManifest(idOrNumber: string) {
    const item = await this.repo.findByIdOrNumber(idOrNumber);
    if (!item) throw new NotFoundError('Shipping Manifest');
    return item;
  }

  async createManifest(data: any) {
    return this.repo.create(data);
  }

  async updateManifest(idOrNumber: string, data: any) {
    const updated = await this.repo.update(idOrNumber, data);
    if (!updated) throw new NotFoundError('Shipping Manifest');
    return updated;
  }

  async deleteManifest(idOrNumber: string) {
    const deleted = await this.repo.delete(idOrNumber);
    if (!deleted) throw new NotFoundError('Shipping Manifest');
    return { deleted: true };
  }
}

export const manifestsService = new ManifestsService();
