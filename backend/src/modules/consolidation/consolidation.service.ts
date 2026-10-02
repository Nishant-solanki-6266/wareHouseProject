import { ConsolidationRepository, consolidationRepository } from './consolidation.repository.js';
import { ConsolidationFilterParams, CreateConsolidationInput, UpdateConsolidationInput } from './consolidation.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';

export class ConsolidationService {
  constructor(private readonly repo: ConsolidationRepository = consolidationRepository) {}

  async listConsolidations(filters: ConsolidationFilterParams) {
    return this.repo.findMany(filters);
  }

  async getConsolidation(idOrNumber: string) {
    const item = await this.repo.findByIdOrNumber(idOrNumber);
    if (!item) throw new NotFoundError('Consolidation');
    return item;
  }

  async createConsolidation(input: CreateConsolidationInput) {
    const consNum = input.consolidationNumber || input.id || `CNS-2026-${Math.floor(820 + Math.random() * 180)}`;
    const weightLbs = Number(input.totalWeightLbs) || 0;
    const weightKg = Number(input.totalWeightKg) || Number((weightLbs * 0.453592).toFixed(1));
    const totalCft = Number(input.totalCft) || 0;
    const totalCbm = Number(input.totalCbm) || 0;
    const capacity = Number(input.containerCapacityCbm) || 67.7;
    const fillPercent = Number(input.containerFillPercentage) || Number(((totalCbm / capacity) * 100).toFixed(1));

    return this.repo.create({
      consolidationNumber: consNum,
      title: input.title,
      destinationPort: input.destinationPort,
      destinationCode: input.destinationCode || (input.destinationPort.includes(' - ') ? input.destinationPort.split(' - ')[0].trim() : 'NAS'),
      createdDate: input.createdDate || new Date().toISOString().split('T')[0],
      status: input.status || 'Planning',
      containerId: input.containerId || null,
      containerNumber: input.containerNumber || '',
      containerType: input.containerType || '40ft High Cube Standard',
      containerCapacityCbm: String(capacity),
      sealNumber: input.sealNumber || '',
      vesselId: input.vesselId || null,
      vesselName: input.vesselName || 'Tropic Carib',
      voyageId: input.voyageId || null,
      voyageNumber: input.voyageNumber || 'TC-2026-081',
      carrier: input.carrier || 'Tropical Shipping',
      loadingPort: input.loadingPort || 'Port of Miami (USMIA)',
      dischargePort: input.dischargePort || 'Nassau Container Port (NAS)',
      totalHouseBills: Number(input.totalHouseBills) || (input.houseBillIds?.length || 0),
      houseBillIds: input.houseBillIds || [],
      totalReceipts: Number(input.totalReceipts) || (input.receiptIds?.length || 0),
      receiptIds: input.receiptIds || [],
      totalPackages: Number(input.totalPackages) || 0,
      totalPieces: Number(input.totalPieces) || 0,
      totalWeightLbs: String(weightLbs),
      totalWeightKg: String(weightKg),
      totalCft: String(totalCft.toFixed(2)),
      totalCbm: String(totalCbm.toFixed(2)),
      containerFillPercentage: String(fillPercent),
      assignedShipmentId: input.assignedShipmentId || null,
      assignedMasterBLId: input.assignedMasterBLId || null,
      notes: input.notes || '',
    });
  }

  async updateConsolidation(id: string, input: UpdateConsolidationInput) {
    await this.getConsolidation(id);
    const updateValues: Record<string, unknown> = { ...input };

    if (input.totalWeightLbs !== undefined) updateValues.totalWeightLbs = String(input.totalWeightLbs);
    if (input.totalWeightKg !== undefined) updateValues.totalWeightKg = String(input.totalWeightKg);
    if (input.totalCft !== undefined) updateValues.totalCft = String(input.totalCft);
    if (input.totalCbm !== undefined) updateValues.totalCbm = String(input.totalCbm);
    if (input.containerCapacityCbm !== undefined) updateValues.containerCapacityCbm = String(input.containerCapacityCbm);
    if (input.containerFillPercentage !== undefined) updateValues.containerFillPercentage = String(input.containerFillPercentage);

    return this.repo.update(id, updateValues);
  }

  async deleteConsolidation(id: string) {
    await this.getConsolidation(id);
    return this.repo.delete(id);
  }
}

export const consolidationService = new ConsolidationService();
