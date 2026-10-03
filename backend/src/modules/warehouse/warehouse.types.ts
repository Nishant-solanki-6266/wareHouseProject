import { PackageItem } from '../../db/schema/warehouse-receipts.schema.js';

export interface WarehouseReceiptFilterParams {
  search?: string;
  status?: string;
  destinationCode?: string;
  customerId?: string;
  agentId?: string;
  limit: number;
  offset: number;
}

export interface CreateWarehouseReceiptInput {
  receiptNumber?: string;
  sequenceNumber?: number;
  date?: string;
  customerId?: string | null;
  customerName?: string | null;
  customer?: string | null;
  shipper?: string | null;
  consignee?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  destinationPort?: string | null;
  destinationCode?: string | null;
  cargoDescription?: string | null;
  packages?: PackageItem[];
  packageCount?: number;
  totalPieces?: number;
  packageType?: string;
  lengthInches?: number | null;
  widthInches?: number | null;
  heightInches?: number | null;
  weightLbs?: number | null;
  weightKg?: number | null;
  cft?: number | null;
  cbm?: number | null;
  totalCft?: number | null;
  totalCbm?: number | null;
  warehouseLocation?: string;
  status?: string;
  hazardous?: boolean;
  fragile?: boolean;
  notes?: string | null;
}

export interface UpdateWarehouseReceiptInput extends Partial<CreateWarehouseReceiptInput> {
  assignedHouseBillId?: string | null;
  assignedConsolidationId?: string | null;
  assignedShipmentId?: string | null;
}
