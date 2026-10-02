export interface ConsolidationFilterParams {
  search?: string;
  status?: string;
  destinationCode?: string;
  limit: number;
  offset: number;
}

export interface CreateConsolidationInput {
  title: string;
  destinationPort: string;
  destinationCode: string;
  status?: string;
  containerNumber?: string;
  containerType?: string;
  containerCapacityCbm?: number;
  sealNumber?: string;
  vesselName?: string;
  voyageNumber?: string;
  carrier?: string;
  loadingPort?: string;
  dischargePort?: string;
  houseBillIds?: string[];
  receiptIds?: string[];
  totalPackages?: number;
  totalPieces?: number;
  totalWeightLbs?: number;
  totalWeightKg?: number;
  totalCft?: number;
  totalCbm?: number;
  containerFillPercentage?: number;
  agentId?: string;
  agentName?: string;
  etd?: string;
  eta?: string;
  notes?: string;
}

