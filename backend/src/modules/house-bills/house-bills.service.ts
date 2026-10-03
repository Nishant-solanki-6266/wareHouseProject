import { HouseBillsRepository, houseBillsRepository } from './house-bills.repository.js';
import { HouseBillFilterParams, CreateHouseBillInput } from './house-bills.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { db } from '../../db/index.js';
import { customers } from '../../db/schema/index.js';
import { eq, or } from 'drizzle-orm';

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
    const hblNumber = input.hblNumber && input.hblNumber.trim()
      ? input.hblNumber.trim()
      : `HBL-2026-${seq}`;
    const createdDate = new Date().toISOString().split('T')[0];

    let resolvedCustomerId: string | undefined = undefined;
    if (input.customerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.customerId)) {
      resolvedCustomerId = input.customerId;
    } else {
      const match = await db
        .select({ id: customers.id })
        .from(customers)
        .where(
          or(
            input.customerId ? eq(customers.customerNumber, input.customerId) : undefined,
            eq(customers.name, input.customerName)
          )
        )
        .limit(1);
      if (match.length > 0) resolvedCustomerId = match[0].id;
    }

    return this.repo.create({
      hblNumber,
      customerId: resolvedCustomerId,
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
      });
  }

  async updateHouseBill(idOrHblNumber: string, input: any) {

    await this.getHouseBill(idOrHblNumber);
    return this.repo.update(idOrHblNumber, input);
  }

  async deleteHouseBill(idOrHblNumber: string) {
    await this.getHouseBill(idOrHblNumber);
    return this.repo.delete(idOrHblNumber);
  }

  async placeHold(
    idOrHblNumber: string,
    params: {
      reason: string;
      placedBy: string;
      holdNotes?: string;
      holdCategory?: string;
    }
  ) {
    await this.getHouseBill(idOrHblNumber);
    return this.repo.update(idOrHblNumber, {
      status: 'On Hold',
      notes: params.holdNotes
        ? `HOLD: ${params.reason} - ${params.holdNotes}`
        : `HOLD: ${params.reason}`,
    });
  }

  async releaseHold(idOrHblNumber: string) {
    await this.getHouseBill(idOrHblNumber);
    return this.repo.update(idOrHblNumber, {
      status: 'Active',
    });
  }
}

export const houseBillsService = new HouseBillsService();

