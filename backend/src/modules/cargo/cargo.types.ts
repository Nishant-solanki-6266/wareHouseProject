export interface CargoFilterParams {
  search?: string;
  status?: string;
  destinationCode?: string;
  warehouseReceiptId?: string;
  limit: number;
  offset: number;
}
