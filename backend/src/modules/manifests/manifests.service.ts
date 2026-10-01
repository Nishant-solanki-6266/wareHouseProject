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
}

export const manifestsService = new ManifestsService();
