import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ResponsiveTable } from '../../components/tables/ResponsiveTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Ship, Eye, ArrowRight, FileText, Lock } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export const AgentShipmentsList = ({ onNavigate }) => {
  const { shipments } = useAppData();

  // Agent assigned shipments only
  const agentShipments = shipments.filter(s => s.agentId === 'AGT-001' || s.destinationCode === 'NAS');

  const columns = [
    {
      header: 'Shipment #',
      accessor: 'shipmentNumber',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 800, color: '#0A192F', fontFamily: 'JetBrains Mono, monospace' }}>
            {item.shipmentNumber}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: 600 }}>
            Trk: {item.trackingNumber}
          </div>
        </div>
      )
    },
    {
      header: 'Vessel / Voyage',
      accessor: 'vesselName',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{item.vesselName}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.voyageNumber} • {item.carrier}</div>
        </div>
      )
    },
    {
      header: 'Container & Seal',
      accessor: 'containerNumber',
      render: (item) => (
        <div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', fontWeight: 600 }}>
            {item.containerNumber}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Seal: {item.sealNumber}</div>
        </div>
      )
    },
    {
      header: 'Cargo Volume',
      accessor: 'totalCbm',
      render: (item) => (
        <div>
          <strong>{item.totalCbm} CBM</strong>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.totalPackages} pkgs ({item.totalWeightLbs?.toLocaleString()} lbs)</div>
        </div>
      )
    },
    {
      header: 'ETA (Nassau)',
      accessor: 'eta',
      render: (item) => (
        <span style={{ fontWeight: 700, color: '#0284C7' }}>{item.eta}</span>
      )
    },
    {
      header: 'Shipment Status',
      accessor: 'status',
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      header: 'B/L Status',
      accessor: 'blStatus',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <StatusBadge status={item.blStatus} />
          {item.blStatus === 'On Hold' && <Lock size={13} style={{ color: '#EF4444' }} />}
        </div>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('agent-bl-detail', item.billOfLadingId || item.id);
          }}
          className="btn btn-sm btn-primary"
          style={{ padding: '0.25rem 0.6rem' }}
        >
          <FileText size={13} />
          <span>Access B/L</span>
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="My Assigned Consignments"
        subtitle="Inbound shipments assigned to Caribbean Express Freight Ltd. (Nassau Hub)."
        icon={Ship}
        breadcrumbs={[
          { label: 'Agent Portal', href: '#' },
          { label: 'My Shipments' }
        ]}
      />

      <ResponsiveTable
        columns={columns}
        data={agentShipments}
        searchPlaceholder="Search assigned shipments, container, vessel..."
        pageSize={6}
        onRowClick={(item) => onNavigate('agent-bl-detail', item.billOfLadingId || item.id)}
      />
    </div>
  );
};
