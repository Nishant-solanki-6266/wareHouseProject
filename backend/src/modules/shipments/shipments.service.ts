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

  async createShipment(data: any) {
    return this.repo.create(data);
  }

  async updateShipment(idOrNumber: string, data: any) {
    const updated = await this.repo.update(idOrNumber, data);
    if (!updated) throw new NotFoundError('Shipment');
    return updated;
  }

  async deleteShipment(idOrNumber: string) {
    const deleted = await this.repo.delete(idOrNumber);
    if (!deleted) throw new NotFoundError('Shipment');
    return { deleted: true };
  }
}

export const shipmentsService = new ShipmentsService();
