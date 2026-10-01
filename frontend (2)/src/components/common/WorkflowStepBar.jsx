import React, { useState } from 'react';
import { Package, FileText, Layers, Ship, FileSpreadsheet, ChevronRight } from 'lucide-react';

export const WorkflowStepBar = ({ activeStep, currentStep, onNavigate }) => {
  const stepNumber = Number(activeStep ?? currentStep ?? 1);
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    {
      step: 1,
      id: 'warehouse-receipts',
      createAction: 'warehouse-receipts',
      title: '1. Warehouse Receipt (WR)',
      subtitle: 'Intake cargo & L/W/H',
      icon: Package,
      actionLabel: '+ New WR'
    },
    {
      step: 2,
      id: 'house-bills',
      createAction: 'house-bills',
      title: '2. House B/L (HBL)',
      subtitle: 'Customer B/L & Rates',
      icon: FileText,
      actionLabel: '+ Issue HBL'
    },
    {
      step: 3,
      id: 'consolidations',
      createAction: 'consolidations',
      title: '3. Consolidation',
      subtitle: 'Pack Container Box',
      icon: Layers,
      actionLabel: '+ Consolidate'
    },
    {
      step: 4,
      id: 'bills-of-lading',
      createAction: 'bills-of-lading',
      title: '4. Master Ocean B/L',
      subtitle: 'Carrier Transport Doc',
      icon: Ship,
      actionLabel: 'View Master B/Ls'
    },
    {
      step: 5,
      id: 'manifests',
      createAction: 'manifests',
      title: '5. Customs Manifest',
      subtitle: 'Clearance & Exports',
      icon: FileSpreadsheet,
      actionLabel: '+ Manifest'
    }
  ];

  return (
    <div
      className="card no-print"
      style={{
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, #0A192F 0%, #0F2744 100%)',
        color: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #1E3A5F',
        boxShadow: '0 4px 12px rgba(10, 25, 47, 0.15)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#0284C7', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>
            WORKFLOW PIPELINE
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F1F5F9' }}>
            5-Stage Freight Forwarding Process
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
          Follow steps in order: <strong style={{ color: '#38BDF8' }}>WR → HBL → Consolidation → Master B/L → Manifest</strong>
        </div>
      </div>

      {/* Grid of Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }} className="grid-cols-5-workflow">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          const isCurrent = stepNumber === st.step;
          const isPast = stepNumber > st.step;
          const isHovered = hoveredStep === st.step;

          let cardBackground = 'rgba(255, 255, 255, 0.05)';
          let cardBorder = '1px solid rgba(255, 255, 255, 0.1)';
          let cardBoxShadow = 'none';

          if (isCurrent) {
            cardBackground = 'rgba(2, 132, 199, 0.28)';
            cardBorder = '1.5px solid #38BDF8';
            cardBoxShadow = '0 0 12px rgba(56, 189, 248, 0.3)';
          } else if (isHovered) {
            cardBackground = isPast ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.12)';
            cardBorder = '1.5px solid rgba(56, 189, 248, 0.6)';
            cardBoxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
          } else if (isPast) {
            cardBackground = 'rgba(56, 189, 248, 0.06)';
            cardBorder = '1px solid rgba(56, 189, 248, 0.3)';
          }

          return (
            <div
              key={st.step}
              onClick={() => onNavigate && onNavigate(st.id)}
              onMouseEnter={() => setHoveredStep(st.step)}
              onMouseLeave={() => setHoveredStep(null)}
              style={{
                background: cardBackground,
                border: cardBorder,
                boxShadow: cardBoxShadow,
                borderRadius: '6px',
                padding: '0.65rem 0.75rem',
                cursor: 'pointer',
                transition: 'all 180ms ease',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon size={16} style={{ color: isCurrent || isHovered ? '#38BDF8' : isPast ? '#34D399' : '#94A3B8' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isCurrent || isHovered ? '#FFFFFF' : '#E2E8F0' }}>
                    {st.title}
                  </span>
                </div>
                {idx < 4 && (
                  <ChevronRight size={13} style={{ color: 'rgba(255,255,255,0.3)' }} className="hide-mobile" />
                )}
              </div>
              <div style={{ fontSize: '0.7rem', color: isHovered ? '#CBD5E1' : '#94A3B8', marginBottom: '0.5rem' }}>
                {st.subtitle}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isCurrent ? '#38BDF8' : isPast ? '#34D399' : isHovered ? '#93C5FD' : '#64748B' }}>
                  {isCurrent ? 'Current View' : isPast ? 'Ready / Linked' : 'Next Stage'}
                </span>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (st.step === 4) {
                        onNavigate('bills-of-lading');
                      } else {
                        onNavigate(st.createAction, 'create');
                      }
                    }}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: isCurrent ? '#0284C7' : isHovered ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      border: isHovered && !isCurrent ? '1px solid rgba(56, 189, 248, 0.5)' : 'none',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 150ms ease'
                    }}
                  >
                    {st.actionLabel}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
