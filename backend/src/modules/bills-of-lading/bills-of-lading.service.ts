import { BillsOfLadingRepository, billsOfLadingRepository } from './bills-of-lading.repository.js';
import { BillOfLadingFilterParams } from './bills-of-lading.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { BL_STATUSES } from '../../common/constants/statuses.js';

export class BillsOfLadingService {
  constructor(private readonly repo: BillsOfLadingRepository = billsOfLadingRepository) {}

  async listBills(filters: BillOfLadingFilterParams) {
    return this.repo.findMany(filters);
  }

  async getBill(idOrNumber: string) {
    const item = await this.repo.findByIdOrNumber(idOrNumber);
    if (!item) throw new NotFoundError('Bill of Lading');
    return item;
  }

  async placeHold(
    id: string,
    params: {
      reason: string;
      placedBy: string;
      holdCategory?: string;
      holdNotes?: string;
      contactEmail?: string;
      contactPhone?: string;
    }
  ) {
    await this.getBill(id);
    const holdDetails = {
      isOnHold: true,
      reason: params.reason,
      placedBy: params.placedBy,
      placedAt: new Date().toISOString(),
      holdCategory: params.holdCategory || 'Financial Clearance',
      holdNotes: params.holdNotes,
      contactEmail: params.contactEmail,
      contactPhone: params.contactPhone,
    };

    return this.repo.updateHoldStatus(id, BL_STATUSES.ON_HOLD, holdDetails);
  }

  async clearHold(id: string, releasedBy: string) {
    await this.getBill(id);
    const holdDetails = {
      isOnHold: false,
      reason: null,
      releasedBy,
      releasedAt: new Date().toISOString(),
    };

    return this.repo.updateHoldStatus(id, BL_STATUSES.RELEASED, holdDetails);
  }
}

export const billsOfLadingService = new BillsOfLadingService();
