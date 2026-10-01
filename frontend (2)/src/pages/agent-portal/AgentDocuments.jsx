import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ResponsiveTable } from '../../components/tables/ResponsiveTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FileStack, FileText, FileSpreadsheet, Lock, Download, Eye, AlertTriangle } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';

export const AgentDocuments = ({ onNavigate }) => {
  const { billsOfLading, manifests } = useAppData();
  const { showToast } = useToast();

  const agentBLs = billsOfLading.filter(b => b.agentId === 'AGT-001' || b.portOfDischarge?.includes('Nassau'));
  const agentManifests = manifests.filter(m => m.portOfDischarge?.includes('Nassau') || m.vesselName?.includes('Island Voyager'));

  const docs = [
    ...agentBLs.map(b => ({
      id: b.id,
      docNumber: b.blNumber,
      docType: 'Master Bill of Lading',
      title: `Consigned to ${b.consignee?.name}`,
      vessel: `${b.oceanVessel} (${b.voyageNumber})`,
      status: b.status,
      isOnHold: b.status === 'On Hold' || b.holdDetails?.isOnHold,
      entityType: 'BL'
    })),
    ...agentManifests.map(m => ({
      id: m.id,
      docNumber: m.manifestNumber,
      docType: 'Shipping Manifest',
      title: `Outward Manifest — ${m.portOfLoading} to ${m.portOfDischarge}`,
      vessel: `${m.vesselName} (${m.voyageNumber})`,
      status: m.status.includes('Hold') ? 'On Hold' : 'Available',
      isOnHold: m.status.includes('Hold'),
      entityType: 'MANIFEST'
    }))
  ];

  const handleDownload = (item) => {
    if (item.isOnHold) {
      showToast(
        `Access Blocked: ${item.docNumber} is currently ON HOLD. Contact Head Office for clearance.`,
        'danger',
        'Download Locked'
      );
    } else {
      showToast(`${item.docNumber}.pdf downloaded.`, 'success', 'Document Downloaded');
    }
  };

  const columns = [
    {
      header: 'Document #',
      accessor: 'docNumber',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 800, color: '#0A192F', fontFamily: 'JetBrains Mono, monospace' }}>
            {item.docNumber}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.docType}</div>
        </div>
      )
    },
    {
      header: 'Consignment / Description',
      accessor: 'title',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0A192F' }}>{item.title}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.vessel}</div>
        </div>
      )
    },
    {
      header: 'Document Status',
      accessor: 'status',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <StatusBadge status={item.status} />
          {item.isOnHold && <Lock size={13} style={{ color: '#EF4444' }} />}
        </div>
      )
    },
    {
      header: 'Access & Actions',
      align: 'right',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(item);
            }}
            className={`btn btn-sm ${item.isOnHold ? 'btn-danger' : 'btn-outline'}`}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            {item.isOnHold ? <Lock size={12} /> : <Download size={12} />}
            <span>{item.isOnHold ? 'Locked' : 'Download'}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (item.entityType === 'BL') onNavigate('agent-bl-detail', item.id);
              else onNavigate('manifests', item.id);
            }}
            className="btn btn-sm btn-primary"
            style={{ padding: '0.25rem 0.6rem' }}
          >
            <Eye size={13} />
            <span>Open</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Agent Document Repository"
        subtitle="Access authorized shipping manifests, released bills of lading, and delivery orders."
        icon={FileStack}
        breadcrumbs={[
          { label: 'Agent Portal', href: '#' },
          { label: 'Documents' }
        ]}
      />

      <ResponsiveTable
        columns={columns}
        data={docs}
        searchPlaceholder="Search agent documents, B/L #, manifest..."
        pageSize={6}
        onRowClick={(item) => {
          if (item.entityType === 'BL') onNavigate('agent-bl-detail', item.id);
          else onNavigate('manifests', item.id);
        }}
      />
    </div>
  );
};
