export const STANDARD_PORTS = [
  { code: 'NAS', name: 'Nassau Container Port (Arawak Cay)', island: 'New Providence', country: 'Bahamas' },
  { code: 'FPO', name: 'Freeport Container Port', island: 'Grand Bahama', country: 'Bahamas' },
  { code: 'MHH', name: 'Marsh Harbour Freight Terminal', island: 'Abaco', country: 'Bahamas' },
  { code: 'GGT', name: 'George Town Harbour Cargo Pier', island: 'Exuma', country: 'Bahamas' },
  { code: 'ELH', name: "Governor's Harbour / North Eleuthera Pier", island: 'Eleuthera', country: 'Bahamas' },
  { code: 'PLS', name: 'Providenciales Commercial Port (South Dock)', island: 'Providenciales', country: 'Turks & Caicos' },
  { code: 'GCM', name: 'George Town Port Authority Cargo Terminal', island: 'Grand Cayman', country: 'Cayman Islands' },
  { code: 'KIN', name: 'Kingston Freeport Terminal (KFTL)', island: 'Jamaica', country: 'Jamaica' },
  { code: 'BGI', name: 'Bridgetown Deep Water Harbour', island: 'Barbados', country: 'Barbados' },
  { code: 'POS', name: 'Port of Spain Harbor Cargo Terminal', island: 'Trinidad', country: 'Trinidad & Tobago' },
  { code: 'MIA', name: 'Port of Miami (USMIA)', island: 'Florida Origin', country: 'United States' },
] as const;

export type PortCode = typeof STANDARD_PORTS[number]['code'];
