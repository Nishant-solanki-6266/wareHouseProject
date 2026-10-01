import { VesselsRepository, vesselsRepository } from './vessels.repository.js';
import { VesselFilterParams } from './vessels.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';

export class VesselsService {
  constructor(private readonly repo: VesselsRepository = vesselsRepository) {}

  async listVessels(filters: VesselFilterParams) {
    return this.repo.findMany(filters);
  }

  async getVessel(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundError('Vessel');
    return item;
  }
}

export const vesselsService = new VesselsService();
