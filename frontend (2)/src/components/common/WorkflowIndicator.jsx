import React from 'react';
import {
  Package,
  Box,
  Layers,
  Ship,
  FileText,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  ChevronRight,
  Truck
} from 'lucide-react';

const WORKFLOW_STAGES = [
  { id: 'warehouse-receipts', key: 'wr', label: 'Warehouse Receipt', shortLabel: 'WR', icon: Package, tab: 'warehouse-receipts' },
  { id: 'cargo', key: 'cargo', label: 'Cargo Inventory', shortLabel: 'Cargo', icon: Box, tab: 'cargo' },
  { id: 'consolidations', key: 'consolidation', label: 'Consolidation', shortLabel: 'Consolidation', icon: Layers, tab: 'consolidations' },
  { id: 'shipments', key: 'shipment', label: 'Shipment', shortLabel: 'Shipment', icon: Ship, tab: 'shipments' },
  { id: 'bills-of-lading', key: 'bl', label: 'B/L (Master & House)', shortLabel: 'B/L', icon: FileText, tab: 'bills-of-lading' },
  { id: 'manifests', key: 'manifest', label: 'Manifest', shortLabel: 'Manifest', icon: FileSpreadsheet, tab: 'manifests' },
  { id: 'agent', key: 'agent', label: 'Destination Agent', shortLabel: 'Agent', icon: Users, tab: 'agents' },
  { id: 'delivery', key: 'delivery', label: 'Delivery', shortLabel: 'Delivery', icon: Truck, tab: 'tracking' }
];

export const WorkflowIndicator = ({
  currentStage = 'warehouse-receipts',
  onNavigate,
  compact = false,
  showLabels = true
}) => {
  // Find current index
  const currentIndex = WORKFLOW_STAGES.findIndex(
    s => s.id === currentStage || s.key === currentStage || s.tab === currentStage
  );
  const activeIdx = currentIndex !== -1 ? currentIndex : 0;

  return (
    <div
      className="workflow-indicator-card no-print"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: compact ? '0.5rem 0.75rem' : '0.75rem 1rem',
        boxShadow: '0 1px 3px rgba(10, 25, 47, 0.05)',
        marginBottom: '0.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: compact ? '0.35rem' : '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            background: '#0284C7',
            color: '#FFFFFF',
            padding: '2px 6px',
            borderRadius: '4px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Workflow
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
            Primary Cargo Journey
          </span>
        </div>

        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
          Current Stage: <strong style={{ color: '#0284C7' }}>{WORKFLOW_STAGES[activeIdx]?.label}</strong>
          {activeIdx < WORKFLOW_STAGES.length - 1 && (
            <span className="hide-mobile">
              {' '}→ Next: <span style={{ color: '#475569', fontWeight: 500 }}>{WORKFLOW_STAGES[activeIdx + 1]?.label}</span>
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Stepper Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          overflowX: 'auto',
          paddingBottom: '2px',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
      >
        {WORKFLOW_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCurrent = idx === activeIdx;
          const isPast = idx < activeIdx;
          const isFuture = idx > activeIdx;

          return (
            <React.Fragment key={stage.id}>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate(stage.tab)}
                title={`Go to ${stage.label}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: compact ? '0.3rem 0.5rem' : '0.4rem 0.65rem',
                  borderRadius: '6px',
                  background: isCurrent
                    ? '#0A192F'
                    : isPast
                    ? '#F0FDF4'
                    : '#F8FAFC',
                  border: isCurrent
                    ? '1.5px solid #0A192F'
                    : isPast
                    ? '1px solid #BBF7D0'
                    : '1px solid #E2E8F0',
                  color: isCurrent
                    ? '#FFFFFF'
                    : isPast
                    ? '#166534'
                    : '#64748B',
                  fontWeight: isCurrent ? 700 : isPast ? 600 : 500,
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  cursor: onNavigate ? 'pointer' : 'default',
                  transition: 'all 150ms ease',
                  flexShrink: 0
                }}
              >
                {isPast ? (
                  <CheckCircle2 size={13} style={{ color: '#16A34A', flexShrink: 0 }} />
                ) : (
                  <Icon
                    size={13}
                    style={{
                      color: isCurrent ? '#38BDF8' : isFuture ? '#94A3B8' : '#166534',
                      flexShrink: 0
                    }}
                  />
                )}
                <span>{stage.shortLabel}</span>
              </button>

              {idx < WORKFLOW_STAGES.length - 1 && (
                <ChevronRight
                  size={12}
                  style={{
                    color: isPast ? '#86EFAC' : '#CBD5E1',
                    flexShrink: 0,
                    margin: '0 1px'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
