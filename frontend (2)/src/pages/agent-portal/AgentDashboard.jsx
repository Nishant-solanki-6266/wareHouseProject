import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { HoldAlertBanner } from '../../components/common/HoldAlertBanner';
import {
  Ship,
  FileText,
  FileStack,
  AlertTriangle,
  ArrowRight,
  Shield,
  PhoneCall,
  Clock,
  CheckCircle2,
  Lock,
  Package
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export const AgentDashboard = ({ onNavigate }) => {
  const { shipments, billsOfLading } = useAppData();

  // Agent assigned shipments (for AGT-001 Caribbean Express Freight)
  const agentShipments = shipments.filter(s => s.agentId === 'AGT-001' || s.destinationCode === 'NAS');
  const agentBLs = billsOfLading.filter(b => b.agentId === 'AGT-001' || b.portOfDischarge?.includes('Nassau'));
  const holdBLs = agentBLs.filter(b => b.status === 'On Hold' || b.holdDetails?.isOnHold);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Agent Portal Dashboard"
        subtitle="Caribbean Express Freight Ltd. (Nassau Port Hub) — Manage assigned cargo, clearance documents, and vessel arrivals."
        icon={Shield}
      />

      {/* Prominent Hold Warning Banner for Agent */}
      {holdBLs.length > 0 && (
        <div>
          {holdBLs.map(bl => (
            <HoldAlertBanner
              key={bl.id}
              blNumber={bl.blNumber}
              holdDetails={bl.holdDetails}
              variant="danger"
            />
          ))}
        </div>
      )}

      {/* KPI Cards for Agent */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Assigned Shipments"
          value={agentShipments.length}
          subtitle="Nassau Port destination"
          icon={Ship}
          accent="navy"
          trend="Inbound"
          trendType="up"
          onClick={() => onNavigate('agent-shipments')}
        />
        <StatCard
          title="B/L On Hold (Locked)"
          value={holdBLs.length}
          subtitle={holdBLs.length > 0 ? "Document release restricted" : "No holds"}
          icon={AlertTriangle}
          accent="warning"
          trend={holdBLs.length > 0 ? "Hold Active" : "Clear"}
          trendType={holdBLs.length > 0 ? "down" : "up"}
          onClick={() => onNavigate('agent-documents')}
        />
        <StatCard
          title="Documents Ready"
          value={agentBLs.length}
          subtitle="Bills of Lading & Manifests"
          icon={FileStack}
          accent="cyan"
          trend="Available"
          trendType="up"
          onClick={() => onNavigate('agent-documents')}
        />
        <StatCard
          title="Inbound Volume"
          value={`${agentShipments.reduce((sum, s) => sum + (Number(s.totalCbm) || 0), 0).toFixed(1)} CBM`}
          subtitle={`${agentShipments.reduce((sum, s) => sum + (Number(s.totalPackages) || 0), 0)} packages scheduled`}
          icon={Package}
          accent="gold"
          trend={agentShipments.length > 0 ? "Active Inbound" : "No Cargo"}
          trendType="neutral"
          onClick={() => onNavigate('agent-shipments')}
        />
      </div>

      {/* Main Agent Content Grid */}
      <div className="grid grid-cols-12 gap-5">
        <div style={{ gridColumn: 'span 8' }} className="col-span-8-mobile">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1rem', color: '#0A192F' }}>My Inbound Assigned Shipments</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                  Consignments staged or en-route to Nassau Container Port
                </p>
              </div>
              <button
                onClick={() => onNavigate('agent-shipments')}
                className="btn btn-ghost btn-sm"
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ padding: '0' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Shipment #</th>
                      <th>Vessel &amp; Voyage</th>
                      <th>Cargo Volume</th>
                      <th>ETA (Nassau)</th>
                      <th>B/L Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentShipments.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                          No inbound assigned shipments found.
                        </td>
                      </tr>
                    ) : (
                      agentShipments.map(s => (
                        <tr key={s.id}>
                          <td>
                            <strong style={{ fontFamily: 'JetBrains Mono, monospace', color: '#0A192F' }}>{s.shipmentNumber}</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Trk: {s.trackingNumber}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{s.vesselName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{s.voyageNumber}</div>
                          </td>
                          <td>
                            <strong>{s.totalCbm} CBM</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{s.totalPackages} pkgs</div>
                          </td>
                          <td>
                            <strong style={{ color: '#0284C7' }}>{s.eta}</strong>
                          </td>
                          <td>
                            <StatusBadge status={s.blStatus} />
                          </td>
                          <td>
                            <button
                              onClick={() => onNavigate('agent-bl-detail', s.billOfLadingId || s.id)}
                              className="btn btn-sm btn-outline"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              <span>B/L Access</span>
                              <ArrowRight size={12} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Port Notice & Head Office Contacts */}
        <div style={{ gridColumn: 'span 4' }} className="col-span-4-mobile">
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#0A192F', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} style={{ color: '#0284C7' }} />
              <span>Head Office Support</span>
            </h3>

            <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
              For hold clearance, payment confirmations, or amended manifests, please contact KERS Operations directly.
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.72rem' }}>Operations Desk:</span>
                <div style={{ fontWeight: 700 }}>+1 (305) 555-KERS (5377) Ext 2</div>
              </div>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.72rem' }}>Documentation &amp; Holds:</span>
                <div style={{ fontWeight: 700, color: '#0284C7' }}>documentation@vicustoms.com</div>
              </div>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.72rem' }}>Terminal Dispatch:</span>
                <div style={{ fontWeight: 600 }}>Port Everglades Berth 14 Gate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
