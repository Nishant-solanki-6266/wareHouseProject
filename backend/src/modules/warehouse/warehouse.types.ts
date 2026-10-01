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
  date?: string;
  customerId?: string;
  customerName: string;
  shipper?: string;
  consignee?: string;
  agentId?: string;
  agentName?: string;
  destinationPort: string;
  destinationCode: string;
  cargoDescription?: string;
  packages?: PackageItem[];
  packageType?: string;
  lengthInches?: number;
  widthInches?: number;
  heightInches?: number;
  weightLbs?: number;
  warehouseLocation?: string;
  status?: string;
  hazardous?: boolean;
  fragile?: boolean;
  notes?: string;
}

export interface UpdateWarehouseReceiptInput extends Partial<CreateWarehouseReceiptInput> {
  assignedHouseBillId?: string;
  assignedConsolidationId?: string;
  assignedShipmentId?: string;
}
