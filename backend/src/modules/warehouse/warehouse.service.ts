import { WarehouseRepository, warehouseRepository } from './warehouse.repository.js';
import { WarehouseReceiptFilterParams, CreateWarehouseReceiptInput, UpdateWarehouseReceiptInput } from './warehouse.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { calculateDimensions, convertLbsToKg } from '../../common/utils/calculations.js';
import { db } from '../../db/index.js';
import { cargo, customers } from '../../db/schema/index.js';
import { eq, or } from 'drizzle-orm';


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

  async createReceipt(input: CreateWarehouseReceiptInput & { receiptNumber?: string; sequenceNumber?: number; totalPieces?: number; customer?: string }) {
    let nextSeq: number;
    if (input.sequenceNumber && !isNaN(Number(input.sequenceNumber))) {
      nextSeq = Number(input.sequenceNumber);
    } else if (input.receiptNumber && !isNaN(Number(input.receiptNumber))) {
      nextSeq = Number(input.receiptNumber);
    } else {
      nextSeq = await this.repo.getNextSequenceNumber();
    }

    const receiptNumber = input.receiptNumber || String(nextSeq);

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

    if (totalPieces === 0 && input.totalPieces) {
      totalPieces = Number(input.totalPieces);
    }

    const totalWeightKg = convertLbsToKg(totalWeightLbs);
    const destPort = input.destinationPort || 'NAS - Nassau Container Port';
    const destCode = input.destinationCode || (destPort.includes(' - ') ? destPort.split(' - ')[0].trim() : 'NAS');

    let resolvedCustomerId: string | undefined = undefined;
    if (input.customerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.customerId)) {
      resolvedCustomerId = input.customerId;
    } else if (input.customerName || input.customerId) {
      const conditions = [];
      if (input.customerId) conditions.push(eq(customers.customerNumber, input.customerId));
      if (input.customerName) conditions.push(eq(customers.name, input.customerName));
      if (conditions.length > 0) {
        const match = await db
          .select({ id: customers.id })
          .from(customers)
          .where(or(...conditions))
          .limit(1);
        if (match.length > 0) resolvedCustomerId = match[0].id;
      }
    }

    const created = await this.repo.create({
      receiptNumber,
      sequenceNumber: nextSeq,
      date: input.date || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerId: resolvedCustomerId || input.customerId || null,
      customerName: input.customerName || input.customer || 'General Cargo Consignee',
      shipper: input.shipper || '',
      consignee: input.consignee || '',
      agentId: input.agentId,
      agentName: input.agentName || 'Caribbean Express Freight Ltd.',
      destinationPort: destPort,
      destinationCode: destCode,
      cargoDescription: input.cargoDescription || 'General Cargo Merchandise',
      packageCount: packages.length,
      totalPieces: totalPieces || 1,
      packageType: input.packageType || (packages[0]?.packageType as string) || 'Carton',
      packages,
      lengthInches: input.lengthInches ? String(input.lengthInches) : null,
      widthInches: input.widthInches ? String(input.widthInches) : null,
      heightInches: input.heightInches ? String(input.heightInches) : null,
      weightLbs: String(totalWeightLbs),
      weightKg: String(totalWeightKg),
      totalCft: String(totalCft.toFixed(2)),
      totalCbm: String(totalCbm.toFixed(2)),
      warehouseLocation: input.warehouseLocation || 'Bay A-1 (CFS Staging)',
      status: input.status || 'Ready for Consolidation',
      hazardous: input.hazardous ?? false,
      fragile: input.fragile ?? false,
      notes: input.notes || '',
      barcode: `WR${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      qrCode: `VI-${receiptNumber}-${destCode}-${totalPieces}PK`,
    });

    // Also populate cargo inventory table
    await db
      .insert(cargo)
      .values({
        cargoNumber: `CRG-${receiptNumber}-01`,
        warehouseReceiptId: created.id,
        receiptNumber: created.receiptNumber,
        customer: created.customerName,
        description: created.cargoDescription || (packages[0]?.description as string) || 'General Cargo',
        packageCount: created.packageCount,
        totalPieces: created.totalPieces,
        packageType: created.packageType,
        lengthInches: created.lengthInches,
        widthInches: created.widthInches,
        heightInches: created.heightInches,
        weightLbs: created.weightLbs,
        weightKg: created.weightKg,
        cft: created.totalCft,
        cbm: created.totalCbm,
        warehouseLocation: created.warehouseLocation,
        destinationPort: created.destinationPort,
        destinationCode: created.destinationCode,
        status: created.status,
        barcode: `CRG${Math.floor(10000000 + Math.random() * 90000000)}`,
        qrCode: `VI-CRG-${created.receiptNumber}`,
      })
      .catch(() => {});

    return created;
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
