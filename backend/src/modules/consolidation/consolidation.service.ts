import { ConsolidationRepository, consolidationRepository } from './consolidation.repository.js';
import { ConsolidationFilterParams, CreateConsolidationInput, UpdateConsolidationInput } from './consolidation.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { db } from '../../db/index.js';
import {
  houseBills,
  warehouseReceipts,
  cargo,
  shipments,
  billsOfLading,
  manifests,
} from '../../db/schema/index.js';
import { inArray } from 'drizzle-orm';
import { auditService } from '../audit/audit.service.js';

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

  async createConsolidation(input: CreateConsolidationInput, currentUser?: { id?: string; name?: string; role?: string }) {
    const totalCount = await this.repo.countTotal();
    const seq = totalCount + 1;
    const consolidationNumber = input.consolidationNumber || `CNS-2026-${String(820 + seq)}`;
    const shipmentNumber = input.assignedShipmentId || `SHP-2026-${String(291 + seq)}`;
    const blNumber = input.assignedMasterBLId || `BL-VI-2026-${String(95 + seq).padStart(4, '0')}`;
    const manifestNumber = `MNF-2026-${String(443 + seq)}`;
    const createdDate = input.createdDate || new Date().toISOString().split('T')[0];

    const weightLbs = Number(input.totalWeightLbs) || 0;
    const weightKg = Number(input.totalWeightKg) || Number((weightLbs * 0.453592).toFixed(1));
    const totalCft = Number(input.totalCft) || 0;
    const totalCbm = Number(input.totalCbm) || 0;
    const capacity = Number(input.containerCapacityCbm) || 67.7;
    const fillPercent = Number(input.containerFillPercentage) || (capacity > 0 ? Number(((totalCbm / capacity) * 100).toFixed(1)) : 0);

    // 1. Create the Consolidation record
    const created = await this.repo.create({
      consolidationNumber,
      title: input.title,
      destinationPort: input.destinationPort,
      destinationCode: input.destinationCode || (input.destinationPort.includes(' - ') ? input.destinationPort.split(' - ')[0].trim() : 'NAS'),
      createdDate,
      status: input.status || 'Loaded',
      containerId: input.containerId || null,
      containerNumber: input.containerNumber || '',
      containerType: input.containerType || "40' High Cube Standard",
      containerCapacityCbm: String(capacity),
      sealNumber: input.sealNumber || '',
      vesselId: input.vesselId || null,
      vesselName: input.vesselName || 'Tropic Carib',
      voyageId: input.voyageId || null,
      voyageNumber: input.voyageNumber || 'TC-2026-081',
      carrier: input.carrier || 'Tropical Shipping',
      loadingPort: input.loadingPort || 'Port of Miami (USMIA)',
      dischargePort: input.dischargePort || input.destinationPort,
      totalHouseBills: (input.houseBillIds || []).length || Number(input.totalHouseBills) || 0,
      houseBillIds: input.houseBillIds || [],
      totalReceipts: (input.receiptIds || []).length || Number(input.totalReceipts) || 0,
      receiptIds: input.receiptIds || [],
      totalPackages: Number(input.totalPackages) || 0,
      totalPieces: Number(input.totalPieces) || 0,
      totalWeightLbs: String(weightLbs),
      totalWeightKg: String(weightKg),
      totalCft: String(totalCft.toFixed(2)),
      totalCbm: String(totalCbm.toFixed(2)),
      containerFillPercentage: String(fillPercent),
      assignedShipmentId: shipmentNumber,
      assignedMasterBLId: blNumber,
      notes: input.notes || '',
    });

    // 2. Cascade: Update linked House Bills
    if (input.houseBillIds && input.houseBillIds.length > 0) {
      await db
        .update(houseBills)
        .set({
          status: 'Consolidated',
          assignedConsolidationId: consolidationNumber,
          assignedMasterBLId: blNumber,
          assignedShipmentId: shipmentNumber,
          updatedAt: new Date(),
        })
        .where(inArray(houseBills.hblNumber, input.houseBillIds))
        .catch(() => {});
    }

    // 3. Cascade: Update linked Warehouse Receipts
    if (input.receiptIds && input.receiptIds.length > 0) {
      await db
        .update(warehouseReceipts)
        .set({
          status: 'Consolidated',
          assignedConsolidationId: consolidationNumber,
          assignedShipmentId: shipmentNumber,
          updatedAt: new Date(),
        })
        .where(inArray(warehouseReceipts.receiptNumber, input.receiptIds))
        .catch(() => {});

      // 4. Cascade: Update linked Cargo Inventory
      await db
        .update(cargo)
        .set({
          status: 'Consolidated',
          warehouseLocation: `Loaded in ${input.containerNumber || 'Container'}`,
          updatedAt: new Date(),
        })
        .where(inArray(cargo.receiptNumber, input.receiptIds))
        .catch(() => {});
    }

    // 5. Cascade: Auto-create Master Shipment
    await db
      .insert(shipments)
      .values({
        shipmentNumber,
        type: 'Ocean LCL Consolidation',
        serviceMode: 'Port-to-Port',
        status: 'Loaded & Sealed',
        trackingNumber: `TRK-VI-${Math.floor(100000 + Math.random() * 900000)}`,
        origin: input.loadingPort || 'Port of Miami (USMIA)',
        destination: input.dischargePort || input.destinationPort,
        destinationPort: input.destinationPort,
        destinationCode: input.destinationCode || 'NAS',
        agentName: input.agentName || 'Caribbean Express Freight Ltd.',
        vesselName: input.vesselName || 'MV Caribbean Carrier',
        voyageNumber: input.voyageNumber || 'V.2026-20W',
        carrier: input.carrier || 'Tropical Shipping Line',
        containerNumber: input.containerNumber || 'MSKU-948291-4',
        containerType: input.containerType || "40' High Cube",
        sealNumber: input.sealNumber || `SEAL-VI-${Math.floor(10000 + Math.random() * 90000)}`,
        billOfLadingNumber: blNumber,
        blStatus: 'Draft',
        manifestNumber,
        consolidationId: consolidationNumber,
        warehouseReceiptIds: input.receiptIds || [],
        totalPackages: input.totalPackages || 0,
        totalWeightLbs: String(weightLbs),
        totalWeightKg: String(weightKg),
        totalCft: String(totalCft.toFixed(2)),
        totalCbm: String(totalCbm.toFixed(2)),
        etd: input.etd || createdDate,
        eta: input.eta || '2026-09-06',
        createdDate,
        currentLocation: `${input.loadingPort || 'Port of Miami'} CFS Yard`,
        trackingCheckpoints: [
          {
            id: `chk-${Date.now()}-1`,
            stage: 'Cargo Received',
            status: 'Completed',
            date: createdDate,
            time: '09:00 AM',
            location: 'VI CFS Miami Warehouse',
            notes: 'Warehouse receipts received and staged.',
          },
          {
            id: `chk-${Date.now()}-2`,
            stage: 'Consolidated',
            status: 'Completed',
            date: createdDate,
            time: '11:00 AM',
            location: 'Miami CFS Yard',
            notes: `Consolidated into ${input.containerNumber || 'Container'}.`,
          },
          {
            id: `chk-${Date.now()}-3`,
            stage: 'Loaded & Sealed',
            status: 'Active',
            date: input.etd || createdDate,
            time: '02:00 PM',
            location: 'Port of Miami Terminal',
            notes: `Container sealed with seal #${input.sealNumber || 'SEAL-01'}.`,
          },
        ],
      })
      .catch(() => {});

    // 6. Cascade: Auto-create Master Bill of Lading
    await db
      .insert(billsOfLading)
      .values({
        blNumber,
        type: 'Master Ocean Bill of Lading',
        status: 'Draft',
        shipmentNumber,
        consolidationId: created.id,
        houseBillIds: input.houseBillIds || [],
        createdDate,
        issueDate: createdDate,
        shipper: {
          name: 'VI Customs Brokers & Logistics',
          address: '1000 NW 22nd Ave, Miami, FL 33125',
          contact: 'Miami Operations Desk',
        },
        consignee: {
          name: input.agentName || 'Caribbean Express Freight Ltd.',
          address: input.destinationPort,
        },
        oceanVessel: input.vesselName || 'MV Caribbean Carrier',
        voyageNumber: input.voyageNumber || 'V.2026-20W',
        carrier: input.carrier || 'Tropical Shipping Line',
        portOfLoading: input.loadingPort || 'Port of Miami (USMIA)',
        portOfDischarge: input.destinationPort,
        containerNumber: input.containerNumber || 'MSKU-948291-4',
        sealNumber: input.sealNumber || 'SEAL-VI-001',
        containerType: input.containerType || "40' High Cube",
        packageCount: input.totalPackages || 0,
        totalPieces: input.totalPieces || 0,
        grossWeightLbs: String(weightLbs),
        grossWeightKg: String(weightKg),
        cbm: String(totalCbm.toFixed(2)),
        cft: String(totalCft.toFixed(2)),
        holdDetails: { isOnHold: false },
      })
      .catch(() => {});

    // 7. Cascade: Auto-create Manifest
    await db
      .insert(manifests)
      .values({
        manifestNumber,
        type: 'Ocean Cargo Inward / Outward Manifest',
        title: `Outward Ocean Cargo Manifest - ${input.vesselName || 'Vessel'} ${input.voyageNumber || ''}`,
        vesselName: input.vesselName || 'MV Caribbean Carrier',
        voyageNumber: input.voyageNumber || 'V.2026-20W',
        portOfLoading: input.loadingPort || 'Port of Miami (USMIA)',
        portOfDischarge: input.destinationPort,
        departureDate: input.etd || createdDate,
        arrivalDate: input.eta || '2026-09-06',
        carrier: input.carrier || 'Tropical Shipping Line',
        totalBLs: 1,
        totalHouseBills: (input.houseBillIds || []).length,
        totalContainers: 1,
        totalPackages: input.totalPackages || 0,
        totalPieces: input.totalPieces || 0,
        totalWeightLbs: String(weightLbs),
        totalWeightKg: String(weightKg),
        totalCbm: String(totalCbm.toFixed(2)),
        totalCft: String(totalCft.toFixed(2)),
        status: 'Generated',
        masterBLNumber: blNumber,
        lineItems: [],
      })
      .catch(() => {});

    // 8. Log audit trail
    if (currentUser) {
      await auditService.logAction({
        userId: currentUser.id,
        userName: currentUser.name || 'Operations Staff',
        userRole: currentUser.role || 'operations',
        module: 'Consolidation',
        action: 'Created Consolidation',
        recordId: consolidationNumber,
        description: `Created Consolidation ${consolidationNumber} with cascade to Shipment ${shipmentNumber}, Master B/L ${blNumber}, and Manifest ${manifestNumber}.`,
      }).catch(() => {});
    }

    return created;
  }

  async updateConsolidation(id: string, input: UpdateConsolidationInput) {
    await this.getConsolidation(id);
    const updateValues: Record<string, unknown> = { ...input };

    if (input.totalWeightLbs !== undefined && input.totalWeightLbs !== null) updateValues.totalWeightLbs = String(input.totalWeightLbs);
    if (input.totalWeightKg !== undefined && input.totalWeightKg !== null) updateValues.totalWeightKg = String(input.totalWeightKg);
    if (input.totalCft !== undefined && input.totalCft !== null) updateValues.totalCft = String(input.totalCft);
    if (input.totalCbm !== undefined && input.totalCbm !== null) updateValues.totalCbm = String(input.totalCbm);
    if (input.containerCapacityCbm !== undefined && input.containerCapacityCbm !== null) updateValues.containerCapacityCbm = String(input.containerCapacityCbm);
    if (input.containerFillPercentage !== undefined && input.containerFillPercentage !== null) updateValues.containerFillPercentage = String(input.containerFillPercentage);

    return this.repo.update(id, updateValues);
  }

  async deleteConsolidation(id: string) {
    await this.getConsolidation(id);
    return this.repo.delete(id);
  }
}

export const consolidationService = new ConsolidationService();
