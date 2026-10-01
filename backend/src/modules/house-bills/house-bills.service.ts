import { HouseBillsRepository, houseBillsRepository } from './house-bills.repository.js';
import { HouseBillFilterParams, CreateHouseBillInput } from './house-bills.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';

export class HouseBillsService {
  constructor(private readonly repo: HouseBillsRepository = houseBillsRepository) {}

  async listHouseBills(filters: HouseBillFilterParams) {
    return this.repo.findMany(filters);
  }

  async getHouseBill(idOrHblNumber: string) {
    const hbl = await this.repo.findByIdOrHblNumber(idOrHblNumber);
    if (!hbl) throw new NotFoundError('House Bill of Lading');
    return hbl;
  }

  async createHouseBill(input: CreateHouseBillInput) {
    const totalCount = await this.repo.countTotal();
    const seq = String(totalCount + 1).padStart(4, '0');
    const hblNumber = `HBL-2026-${seq}`;
    const createdDate = new Date().toISOString().split('T')[0];

    return this.repo.create({
      hblNumber,
      customerId: input.customerId,
      customerName: input.customerName,
      shipper: input.shipper,
      consignee: input.consignee,
      notifyParty: input.notifyParty,
      agentId: input.agentId,
      agentName: input.agentName,
      originPort: input.originPort || 'Port of Miami (USMIA), FL',
      destinationPort: input.destinationPort,
      destinationCode: input.destinationCode,
      warehouseReceiptIds: input.warehouseReceiptIds,
      cargoDescription: input.cargoDescription,
      packages: input.packages || [],
      totalPackages: input.totalPackages ?? 0,
      totalPieces: input.totalPieces ?? 0,
      totalWeightLbs: input.totalWeightLbs ? String(input.totalWeightLbs) : '0.00',
      totalWeightKg: input.totalWeightKg ? String(input.totalWeightKg) : '0.00',
      totalCft: input.totalCft ? String(input.totalCft) : '0.00',
      totalCbm: input.totalCbm ? String(input.totalCbm) : '0.00',
      status: 'Active',
      freightTerms: input.freightTerms || 'Freight Prepaid',
      createdDate,
      issueDate: createdDate,
      notes: input.notes,
    });
  }
}

export const houseBillsService = new HouseBillsService();
