import { ShipmentsRepository, shipmentsRepository } from './shipments.repository.js';
import { ShipmentFilterParams } from './shipments.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';

export class ShipmentsService {
  constructor(private readonly repo: ShipmentsRepository = shipmentsRepository) {}

  async listShipments(filters: ShipmentFilterParams) {
    return this.repo.findMany(filters);
  }

  async getShipment(idOrNumber: string) {
    const item = await this.repo.findByIdOrNumber(idOrNumber);
    if (!item) throw new NotFoundError('Shipment');
    return item;
  }
}

export const shipmentsService = new ShipmentsService();
