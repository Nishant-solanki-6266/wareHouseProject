import { ShipmentsRepository, shipmentsRepository } from './shipments.repository.js';
import { ShipmentFilterParams, CreateShipmentInput, UpdateShipmentInput } from './shipments.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { convertLbsToKg } from '../../common/utils/calculations.js';

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

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

  async createShipment(input: CreateShipmentInput) {
    const totalCount = await this.repo.countTotal();
    const seq = String(totalCount + 1).padStart(4, '0');
    const shipmentNumber = input.shipmentNumber && input.shipmentNumber.trim()
      ? input.shipmentNumber.trim()
      : `SHP-2026-${seq}`;

    const trackingNumber = input.trackingNumber && input.trackingNumber.trim()
      ? input.trackingNumber.trim()
      : `TRK-VI-${Math.floor(100000 + Math.random() * 900000)}`;

    const createdDate = input.createdDate || new Date().toISOString().split('T')[0];
    const destinationPort = input.destinationPort || 'NAS - Nassau Container Port';
    const destination = input.destination || destinationPort;
    const origin = input.origin || 'Port of Miami (USMIA)';

    const validAgentId = input.agentId && UUID_REGEX.test(input.agentId) ? input.agentId : null;

    const totalWeightLbsNum = Number(input.totalWeightLbs) || 0;
    const totalWeightKgNum = input.totalWeightKg ? Number(input.totalWeightKg) : convertLbsToKg(totalWeightLbsNum);

    const checkpoints = (input.trackingCheckpoints && input.trackingCheckpoints.length > 0)
      ? input.trackingCheckpoints
      : [
          {
            id: 'CHK-01',
            stage: input.status || 'Cargo Received',
            status: 'Completed' as const,
            date: createdDate,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: origin,
            notes: 'Shipment created and staged in CFS warehouse',
          },
        ];

    return this.repo.create({
      shipmentNumber,
      type: input.type || 'Ocean LCL Consolidation',
      serviceMode: input.serviceMode || 'Port-to-Port',
      status: input.status || 'Cargo Received',
      trackingNumber,
      origin,
      destination,
      destinationPort,
      destinationCode: input.destinationCode || 'NAS',
      agentId: validAgentId,
      agentName: input.agentName || null,
      vesselName: input.vesselName || null,
      voyageNumber: input.voyageNumber || null,
      carrier: input.carrier || 'Tropical Shipping',
      containerNumber: input.containerNumber || null,
      containerType: input.containerType || "40' Standard Dry",
      sealNumber: input.sealNumber || null,
      billOfLadingId: input.billOfLadingId || null,
      billOfLadingNumber: input.billOfLadingNumber || null,
      blStatus: input.blStatus || 'Draft',
      manifestNumber: input.manifestNumber || null,
      totalPackages: Number(input.totalPackages) || 0,
      totalWeightLbs: String(totalWeightLbsNum.toFixed(2)),
      totalWeightKg: String(totalWeightKgNum.toFixed(2)),
      totalCft: String((Number(input.totalCft) || 0).toFixed(2)),
      totalCbm: String((Number(input.totalCbm) || 0).toFixed(2)),
      etd: input.etd || createdDate,
      eta: input.eta || null,
      createdDate,
      warehouseReceiptIds: input.warehouseReceiptIds || [],
      consolidationId: input.consolidationId || null,
      currentLocation: input.currentLocation || origin,
      trackingCheckpoints: checkpoints,
    });
  }

  async updateShipment(id: string, input: UpdateShipmentInput) {
    await this.getShipment(id);

    const updatePayload: Record<string, unknown> = { ...input };
    if (input.agentId !== undefined) {
      updatePayload.agentId = input.agentId && UUID_REGEX.test(input.agentId) ? input.agentId : null;
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

  async deleteShipment(id: string) {
    await this.getShipment(id);
    return this.repo.delete(id);
  }
}

export const shipmentsService = new ShipmentsService();
