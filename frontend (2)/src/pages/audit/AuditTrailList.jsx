import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ResponsiveTable } from '../../components/tables/ResponsiveTable';
import { Activity, ShieldAlert, CheckCircle2, User, Clock, FileText } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export const AuditTrailList = () => {
  const { auditLogs, fetchMenuApi } = useAppData();

  React.useEffect(() => {
    if (fetchMenuApi) {
      fetchMenuApi('audit');
    }
  }, [fetchMenuApi]);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (item) => (
        <div>
          <strong style={{ fontSize: '0.8rem', color: '#0A192F' }}>{item.timestamp}</strong>
          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{item.ipAddress}</div>
        </div>
      )
    },
    {
      header: 'User / Officer',
      accessor: 'user',
      render: (item) => (
        <span style={{ fontWeight: 600, color: '#0284C7' }}>{item.user || item.userName}</span>
      )
    },
    {
      header: 'Module',
      accessor: 'module',
      render: (item) => (
        <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
          {item.module}
        </span>
      )
    },
    {
      header: 'Action Taken',
      accessor: 'action',
      render: (item) => {
        const isHoldAction = item.action.includes('Hold');
        const isClearAction = item.action.includes('Cleared');
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '0.8rem', color: isHoldAction && !isClearAction ? '#DC2626' : isClearAction ? '#16A34A' : '#0A192F' }}>
            {isHoldAction && !isClearAction && <ShieldAlert size={14} />}
            {isClearAction && <CheckCircle2 size={14} />}
            <span>{item.action}</span>
          </div>
        );
      }
    },
    {
      header: 'Record Ref',
      accessor: 'recordId',
      render: (item) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#D97706', fontSize: '0.8rem' }}>
          {item.recordId}
        </span>
      )
    },
    {
      header: 'Activity Description & System Log',
      accessor: 'description',
      render: (item) => (
        <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
          {item.description}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="System Audit Trail &amp; Activity Log"
        subtitle="Immutable compliance log tracking cargo intake, consolidations, B/L holds, releases, and manifest generation."
        icon={Activity}
        breadcrumbs={[
          { label: 'System', href: '#' },
          { label: 'Audit Trail' }
        ]}
      />

      <ResponsiveTable
        columns={columns}
        data={auditLogs}
        searchPlaceholder="Search user, action, module, record ID..."
        filterOptions={['All', 'Bill of Lading', 'Warehouse Receipt', 'Consolidation', 'Shipping Manifest', 'Agent Portal']}
        pageSize={8}
      />
    </div>
  );
};
