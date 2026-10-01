import React from 'react';

export const BarcodeVisual = ({ value = "KERS10419283", height = 48, showText = true }) => {
  // Generate deterministic barcode bar widths from hash of string
  const getBars = (str) => {
    const bars = [];
    let seed = 0;
    for (let i = 0; i < str.length; i++) {
      seed = (seed * 31 + str.charCodeAt(i)) % 1000;
    }
    
    // Standard start pattern
    bars.push(2, 1, 1, 2);
    
    for (let i = 0; i < 28; i++) {
      const w = ((seed + i * 17) % 3) + 1;
      bars.push(w);
    }
    // Standard stop pattern
    bars.push(2, 1, 1, 3);
    return bars;
  };

  const bars = getBars(value);
  let totalWidth = 0;
  bars.forEach(b => { totalWidth += b * 2; });

  let currentX = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
      <svg width={totalWidth} height={height} viewBox={`0 0 ${totalWidth} ${height}`} style={{ display: 'block' }}>
        {bars.map((w, idx) => {
          const isBar = idx % 2 === 0;
          const barWidth = w * 2;
          const rect = isBar ? (
            <rect key={idx} x={currentX} y="0" width={barWidth} height={height} fill="#000000" />
          ) : null;
          currentX += barWidth;
          return rect;
        })}
      </svg>
      {showText && (
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.2em',
          marginTop: '3px',
          color: '#000000'
        }}>
          *{value}*
        </span>
      )}
    </div>
  );
};

export const QrVisual = ({ value = "VI-LOGISTICS-QR", size = 80 }) => {
  // Generate pseudo-QR pattern matrix
  const gridSize = 19;
  const cellSize = size / gridSize;

  const isCornerFinder = (r, c) => {
    // Top-Left (7x7)
    if (r < 7 && c < 7) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Top-Right (7x7)
    if (r < 7 && c >= gridSize - 7) {
      const col = c - (gridSize - 7);
      if (r === 0 || r === 6 || col === 0 || col === 6) return true;
      if (r >= 2 && r <= 4 && col >= 2 && col <= 4) return true;
      return false;
    }
    // Bottom-Left (7x7)
    if (r >= gridSize - 7 && c < 7) {
      const row = r - (gridSize - 7);
      if (row === 0 || row === 6 || c === 0 || c === 6) return true;
      if (row >= 2 && row <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    return null;
  };

  const cells = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 37 + value.charCodeAt(i)) % 99999;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const finder = isCornerFinder(r, c);
      if (finder !== null) {
        if (finder) cells.push({ r, c });
      } else {
        // Pseudo random data cell
        const bit = ((hash + r * 13 + c * 7 + r * c) % 5) < 2;
        if (bit) cells.push({ r, c });
      }
    }
  }

  return (
    <div style={{
      display: 'inline-flex',
      padding: '4px',
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '4px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="#FFFFFF" />
        {cells.map((cell, idx) => (
          <rect
            key={idx}
            x={cell.c * cellSize}
            y={cell.r * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#0A192F"
          />
        ))}
      </svg>
    </div>
  );
};
