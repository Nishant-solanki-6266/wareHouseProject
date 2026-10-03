import { ConsolidationRepository, consolidationRepository } from './consolidation.repository.js';
import { ConsolidationFilterParams, CreateConsolidationInput, UpdateConsolidationInput } from './consolidation.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { convertLbsToKg } from '../../common/utils/calculations.js';

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

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
    const totalCount = await this.repo.countTotal();
    const seq = String(totalCount + 1).padStart(4, '0');
    const consolidationNumber = input.consolidationNumber && input.consolidationNumber.trim()
      ? input.consolidationNumber.trim()
      : `CNS-2026-${seq}`;

    const createdDate = input.createdDate || new Date().toISOString().split('T')[0];
    const destinationPort = input.destinationPort || 'NAS - Nassau Container Port';
    const dischargePort = input.dischargePort || destinationPort;
    const loadingPort = input.loadingPort || 'Port of Miami (USMIA)';
    const title = input.title || `Consolidation - ${destinationPort} (${createdDate})`;

    const validContainerId = input.containerId && UUID_REGEX.test(input.containerId) ? input.containerId : null;
    const validVesselId = input.vesselId && UUID_REGEX.test(input.vesselId) ? input.vesselId : null;
    const validVoyageId = input.voyageId && UUID_REGEX.test(input.voyageId) ? input.voyageId : null;

    const weightLbs = Number(input.totalWeightLbs) || 0;
    const weightKg = input.totalWeightKg ? Number(input.totalWeightKg) : convertLbsToKg(weightLbs);

    return this.repo.create({
      consolidationNumber,
      title,
      destinationPort,
      destinationCode: input.destinationCode || 'NAS',
      createdDate,
      status: input.status || 'Planning',
      containerId: validContainerId,
      containerNumber: input.containerNumber || null,
      containerType: input.containerType || "40' Standard Dry",
      containerCapacityCbm: input.containerCapacityCbm ? String(Number(input.containerCapacityCbm).toFixed(2)) : '67.70',
      sealNumber: input.sealNumber || null,
      vesselId: validVesselId,
      vesselName: input.vesselName || null,
      voyageId: validVoyageId,
      voyageNumber: input.voyageNumber || null,
      carrier: input.carrier || 'Tropical Shipping Line',
      loadingPort,
      dischargePort,
      totalHouseBills: Number(input.totalHouseBills) || 0,
      houseBillIds: input.houseBillIds || [],
      totalReceipts: Number(input.totalReceipts) || 0,
      receiptIds: input.receiptIds || [],
      totalPackages: Number(input.totalPackages) || 0,
      totalPieces: Number(input.totalPieces) || Number(input.totalPackages) || 0,
      totalWeightLbs: String(weightLbs.toFixed(2)),
      totalWeightKg: String(weightKg.toFixed(2)),
      totalCft: String((Number(input.totalCft) || 0).toFixed(2)),
      totalCbm: String((Number(input.totalCbm) || 0).toFixed(2)),
      containerFillPercentage: String((Number(input.containerFillPercentage) || 0).toFixed(2)),
      assignedShipmentId: input.assignedShipmentId || null,
      assignedMasterBLId: input.assignedMasterBLId || null,
      agentId: input.agentId || null,
      agentName: input.agentName || null,
      notes: input.notes || null,
    });
  }

  async updateConsolidation(id: string, input: UpdateConsolidationInput) {
    await this.getConsolidation(id);

    const updatePayload: Record<string, unknown> = { ...input };
    if (input.containerId !== undefined) {
      updatePayload.containerId = input.containerId && UUID_REGEX.test(input.containerId) ? input.containerId : null;
    }
    if (input.vesselId !== undefined) {
      updatePayload.vesselId = input.vesselId && UUID_REGEX.test(input.vesselId) ? input.vesselId : null;
    }
    if (input.voyageId !== undefined) {
      updatePayload.voyageId = input.voyageId && UUID_REGEX.test(input.voyageId) ? input.voyageId : null;
    }
    if (input.totalWeightLbs !== undefined) {
      updatePayload.totalWeightLbs = String((Number(input.totalWeightLbs) || 0).toFixed(2));
    }
    if (input.totalWeightKg !== undefined) {
      updatePayload.totalWeightKg = String((Number(input.totalWeightKg) || 0).toFixed(2));
    }
    if (input.totalCft !== undefined) {
      updatePayload.totalCft = String((Number(input.totalCft) || 0).toFixed(2));
    }
    if (input.totalCbm !== undefined) {
      updatePayload.totalCbm = String((Number(input.totalCbm) || 0).toFixed(2));
    }

    return this.repo.update(id, updatePayload);
  }

  async deleteConsolidation(id: string) {
    await this.getConsolidation(id);
    return this.repo.delete(id);
  }
}

export const consolidationService = new ConsolidationService();
