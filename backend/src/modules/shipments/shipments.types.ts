export interface ShipmentFilterParams {
  search?: string;
  status?: string;
  destinationCode?: string;
  agentId?: string;
  limit: number;
  offset: number;
}
