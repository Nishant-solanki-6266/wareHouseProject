import { WarehouseRepository, warehouseRepository } from './warehouse.repository.js';
import { WarehouseReceiptFilterParams, CreateWarehouseReceiptInput, UpdateWarehouseReceiptInput } from './warehouse.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { calculateDimensions, convertLbsToKg } from '../../common/utils/calculations.js';

export class WarehouseService {
  constructor(private readonly repo: WarehouseRepository = warehouseRepository) {}

  async listReceipts(filters: WarehouseReceiptFilterParams) {
    return this.repo.findMany(filters);
  }

  async getReceipt(idOrReceiptNumber: string) {
    const receipt = await this.repo.findByIdOrReceiptNumber(idOrReceiptNumber);
    if (!receipt) {
      throw new NotFoundError('Warehouse Receipt');
    }
    return receipt;
  }

  async createReceipt(input: CreateWarehouseReceiptInput) {
    const nextSeq = await this.repo.getNextSequenceNumber();
    const receiptNumber = String(nextSeq);

    let packages = input.packages ?? [];
    if (packages.length === 0) {
      const length = Number(input.lengthInches) || 0;
      const width = Number(input.widthInches) || 0;
      const height = Number(input.heightInches) || 0;
      const weight = Number(input.weightLbs) || 0;
      const { cft, cbm } = calculateDimensions(length, width, height, 1);

      packages = [
        {
          id: `PKG-${receiptNumber}-01`,
          packageType: input.packageType || 'Carton',
          description: input.cargoDescription || 'General Cargo',
          lengthInches: length,
          widthInches: width,
          heightInches: height,
          weightLbs: weight,
          pieces: 1,
          cft,
          cbm,
        },
      ];
    }

    let totalPieces = 0;
    let totalWeightLbs = 0;
    let totalCft = 0;
    let totalCbm = 0;

    for (const pkg of packages) {
      totalPieces += Number(pkg.pieces) || 1;
      totalWeightLbs += Number(pkg.weightLbs) || 0;
      totalCft += Number(pkg.cft) || 0;
      totalCbm += Number(pkg.cbm) || 0;
    }

    const totalWeightKg = convertLbsToKg(totalWeightLbs);

    const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const validCustomerId = input.customerId && UUID_REGEX.test(input.customerId) ? input.customerId : null;
    const validAgentId = input.agentId && UUID_REGEX.test(input.agentId) ? input.agentId : null;

    return this.repo.create({
      receiptNumber,
      sequenceNumber: nextSeq,
      date: input.date || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerId: validCustomerId,
      customerName: input.customerName,
      shipper: input.shipper,
      consignee: input.consignee,
      agentId: validAgentId,
      agentName: input.agentName,
      destinationPort: input.destinationPort,
      destinationCode: input.destinationCode,
      cargoDescription: input.cargoDescription,
      packageCount: packages.length,
      totalPieces,
      packageType: input.packageType || packages[0]?.packageType || 'Cartons',
      packages,
      lengthInches: input.lengthInches ? String(input.lengthInches) : null,
      widthInches: input.widthInches ? String(input.widthInches) : null,
      heightInches: input.heightInches ? String(input.heightInches) : null,
      weightLbs: String(totalWeightLbs),
      weightKg: String(totalWeightKg),
      totalCft: String(totalCft.toFixed(2)),
      totalCbm: String(totalCbm.toFixed(2)),
      warehouseLocation: input.warehouseLocation || 'CFS Miami',
      status: input.status || 'Ready for Consolidation',
      hazardous: input.hazardous ?? false,
      fragile: input.fragile ?? false,
      notes: input.notes,
      barcode: `WR${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      qrCode: `VI-${receiptNumber}-${input.destinationCode}-${totalPieces}PK`,
    });
  }

  async updateReceipt(id: string, input: UpdateWarehouseReceiptInput) {
    await this.getReceipt(id);
    return this.repo.update(id, input);
  }

  async deleteReceipt(id: string) {
    await this.getReceipt(id);
    return this.repo.delete(id);
  }
}

export const warehouseService = new WarehouseService();
