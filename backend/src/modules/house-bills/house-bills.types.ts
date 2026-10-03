import { ShipperInfo, ConsigneeInfo, NotifyPartyInfo } from '../../db/schema/house-bills.schema.js';

export interface HouseBillFilterParams {
  search?: string;
  status?: string;
  destinationCode?: string;
  customerId?: string;
  limit: number;
  offset: number;
}

export interface CreateHouseBillInput {
  hblNumber?: string;
  customerId?: string;
  customerName: string;
  shipper: ShipperInfo;
  consignee: ConsigneeInfo;
  notifyParty?: NotifyPartyInfo;
  agentId?: string;
  agentName?: string;
  originPort?: string;
  destinationPort: string;
  destinationCode: string;
  warehouseReceiptIds: string[];
  cargoDescription?: string;
  packages?: unknown[];
  totalPackages?: number;
  totalPieces?: number;
  totalWeightLbs?: number;
  totalWeightKg?: number;
  totalCft?: number;
  totalCbm?: number;
  freightTerms?: string;
  notes?: string;
}
