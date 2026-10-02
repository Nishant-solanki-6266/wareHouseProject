export interface ConsolidationFilterParams {
  search?: string;
  status?: string;
  destinationCode?: string;
  limit: number;
  offset: number;
}

export interface CreateConsolidationInput {
  id?: string;
  consolidationNumber?: string;
  title: string;
  destinationPort: string;
  destinationCode?: string;
  createdDate?: string;
  status?: string;
  containerId?: string | null;
  containerNumber?: string | null;
  containerType?: string | null;
  containerCapacityCbm?: number | null;
  sealNumber?: string | null;
  vesselId?: string | null;
  vesselName?: string | null;
  voyageId?: string | null;
  voyageNumber?: string | null;
  carrier?: string | null;
  loadingPort?: string;
  dischargePort?: string;
  totalHouseBills?: number;
  houseBillIds?: string[];
  totalReceipts?: number;
  receiptIds?: string[];
  totalPackages?: number;
  totalPieces?: number;
  totalWeightLbs?: number | null;
  totalWeightKg?: number | null;
  totalCft?: number | null;
  totalCbm?: number | null;
  containerFillPercentage?: number | null;
  assignedShipmentId?: string | null;
  assignedMasterBLId?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  etd?: string | null;
  eta?: string | null;
  notes?: string | null;
}

export interface UpdateConsolidationInput extends Partial<CreateConsolidationInput> {}
