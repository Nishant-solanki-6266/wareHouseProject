export const RECEIPT_STATUSES = {
  READY_FOR_CONSOLIDATION: 'Ready for Consolidation',
  CONSOLIDATED: 'Consolidated',
  HOLD: 'On Hold',
  RELEASED: 'Released',
} as const;

export const HBL_STATUSES = {
  ACTIVE: 'Active',
  CONSOLIDATED: 'Consolidated',
  CANCELLED: 'Cancelled',
} as const;

export const CONSOLIDATION_STATUSES = {
  PLANNING: 'Planning',
  LOADED: 'Loaded',
  SEALED: 'Sealed',
  COMPLETED: 'Completed',
} as const;

export const BL_STATUSES = {
  DRAFT: 'Draft',
  ON_HOLD: 'On Hold',
  RELEASED: 'Released',
  CANCELLED: 'Cancelled',
} as const;

export const SHIPMENT_STATUSES = {
  CARGO_RECEIVED: 'Cargo Received',
  CONSOLIDATED: 'Consolidated',
  LOADED_AND_SEALED: 'Loaded & Sealed',
  IN_TRANSIT: 'In Transit',
  ARRIVED_AT_PORT: 'Arrived at Port',
  DELIVERED_RELEASED: 'Delivered / Released',
} as const;
