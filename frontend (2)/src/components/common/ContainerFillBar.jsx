import React from 'react';
import { Box } from 'lucide-react';

export const ContainerFillBar = ({
  fillPercentage = 0,
  currentCbm = 0,
  maxCbm = 76.2,
  containerType = "40' High Cube",
  containerNumber
}) => {
  const pct = Math.min(100, Math.max(0, Number(fillPercentage) || 0));
  const isOverload = pct > 95;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#334155' }}>
          <Box size={14} style={{ color: '#0284C7' }} />
          <span>{containerNumber ? `${containerNumber} (${containerType})` : containerType}</span>
        </span>
        <span style={{ fontWeight: 700, color: isOverload ? '#EF4444' : '#0A192F' }}>
          {pct.toFixed(1)}% Capacity
        </span>
      </div>

      <div className="container-fill-meter">
        <div
          className={`container-fill-bar ${isOverload ? 'overload' : ''}`}
          style={{
            width: `${pct}%`,
            minWidth: pct > 0 ? '6px' : '0px'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B' }}>
        <span>Loaded: <strong>{currentCbm} CBM</strong></span>
        <span>Max Capacity: <strong>{maxCbm} CBM</strong></span>
      </div>
    </div>
  );
};
