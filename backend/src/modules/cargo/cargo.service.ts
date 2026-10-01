import { CargoRepository, cargoRepository } from './cargo.repository.js';
import { CargoFilterParams } from './cargo.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';

export class CargoService {
  constructor(private readonly repo: CargoRepository = cargoRepository) {}

  async listCargo(filters: CargoFilterParams) {
    return this.repo.findMany(filters);
  }

  async getCargo(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundError('Cargo');
    return item;
  }
}

export const cargoService = new CargoService();
