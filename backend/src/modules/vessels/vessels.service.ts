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

  async createVessel(input: Record<string, unknown>) {
    return this.repo.create(input);
  }

  async updateVessel(id: string, input: Record<string, unknown>) {
    await this.getVessel(id);
    return this.repo.update(id, input);
  }

  async deleteVessel(id: string) {
    await this.getVessel(id);
    return this.repo.delete(id);
  }
}


export const vesselsService = new VesselsService();
