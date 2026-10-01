import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, Ban, Truck, ShieldAlert, Package, Anchor } from 'lucide-react';

export const StatusBadge = ({ status, size = 'default', showIcon = true }) => {
  if (!status) return null;

  const normalized = status.toLowerCase().trim();

  let badgeClass = 'badge-draft';
  let IconComponent = Clock;

  if (normalized.includes('hold')) {
    badgeClass = 'badge-hold';
    IconComponent = AlertTriangle;
  } else if (normalized.includes('released') || normalized.includes('delivered') || normalized.includes('cleared') || normalized === 'active') {
    badgeClass = 'badge-released';
    IconComponent = CheckCircle2;
  } else if (normalized.includes('cancel')) {
    badgeClass = 'badge-cancelled';
    IconComponent = Ban;
  } else if (normalized.includes('transit') || normalized.includes('sailing') || normalized.includes('at sea')) {
    badgeClass = 'badge-transit';
    IconComponent = Anchor;
  } else if (normalized.includes('consolidated') || normalized.includes('loaded') || normalized.includes('sealed')) {
    badgeClass = 'badge-consolidated';
    IconComponent = Package;
  } else if (normalized.includes('ready')) {
    badgeClass = 'badge-gold';
    IconComponent = Clock;
  } else if (normalized.includes('received')) {
    badgeClass = 'badge-navy';
    IconComponent = Package;
  }

  const padding = size === 'sm' ? '0.2rem 0.5rem' : size === 'lg' ? '0.4rem 0.85rem' : '0.3rem 0.65rem';
  const fontSize = size === 'sm' ? '0.7rem' : size === 'lg' ? '0.85rem' : '0.75rem';

  return (
    <span className={`badge ${badgeClass}`} style={{ padding, fontSize }}>
      <span className="badge-dot" />
      {showIcon && <IconComponent size={size === 'sm' ? 12 : 13} style={{ flexShrink: 0 }} />}
      <span>{status}</span>
    </span>
  );
};
