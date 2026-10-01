import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ResponsiveTable } from '../../components/tables/ResponsiveTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AgentModal } from '../../components/modals/AgentModal';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { Users, Eye, Edit2, Trash2, Plus, Ship, ExternalLink, Mail, Phone } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';

export const AgentManagementList = ({ onNavigate }) => {
  const { agents, createAgent, updateAgent, deleteAgent } = useAppData();
  const { switchUser } = useAuth();
  const [editingAgent, setEditingAgent] = useState(null);
  const [deletingAgent, setDeletingAgent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const columns = [
    {
      header: 'Agent & Code',
      accessor: 'name',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0A192F' }}>{item.name}</div>
          <div style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
            {item.agentCode}
          </div>
        </div>
      )
    },
    {
      header: 'Assigned Territory',
      accessor: 'territory',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0284C7' }}>{item.territory}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.address}</div>
        </div>
      )
    },
    {
      header: 'Contact Details',
      accessor: 'contactPerson',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{item.contactPerson}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.email} • {item.phone}</div>
        </div>
      )
    },
    {
      header: 'Active Shipments',
      accessor: 'activeShipmentsCount',
      render: (item) => (
        <span style={{ fontWeight: 700, color: item.activeShipmentsCount > 0 ? '#0284C7' : '#64748B' }}>
          {item.activeShipmentsCount} Shipments
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Log into agent portal as this agent
              switchUser('USR-004');
              onNavigate('agent-dashboard');
            }}
            className="btn btn-sm btn-outline"
            title="Log in as this Agent to test Agent Portal view"
            style={{ padding: '0.25rem 0.45rem', fontSize: '0.75rem', color: '#D97706' }}
          >
            <ExternalLink size={12} />
            <span className="hide-mobile">Portal</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingAgent(item);
            }}
            className="btn btn-sm btn-secondary"
            title="Edit Agent"
            style={{ padding: '0.25rem 0.45rem' }}
          >
            <Edit2 size={13} />
            <span className="hide-mobile">Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingAgent(item);
            }}
            className="btn btn-sm btn-ghost"
            title="Delete Agent"
            style={{ padding: '0.25rem 0.45rem', color: '#EF4444' }}
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('agents', item.id);
            }}
            className="btn btn-sm btn-primary"
            style={{ padding: '0.25rem 0.6rem' }}
          >
            <Eye size={13} />
            <span>Profile</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Destination Port Agent Management"
        subtitle="Manage authorized Caribbean shipping agents, territory assignments, and portal access."
        icon={Users}
        breadcrumbs={[
          { label: 'Management', href: '#' },
          { label: 'Agents' }
        ]}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} />
            <span>+ Register Port Agent</span>
          </button>
        }
      />

      <ResponsiveTable
        columns={columns}
        data={agents}
        searchPlaceholder="Search agent name, code, territory, contact..."
        pageSize={6}
        onRowClick={(item) => onNavigate('agents', item.id)}
      />

      {/* Add Agent Modal */}
      <AgentModal
        isOpen={showAddModal}
        isEdit={false}
        onClose={() => setShowAddModal(false)}
        onSave={async (newAgentData) => {
          await createAgent(newAgentData);
        }}
      />

      {/* Edit Agent Modal */}
      <AgentModal
        isOpen={!!editingAgent}
        agent={editingAgent}
        isEdit={true}
        onClose={() => setEditingAgent(null)}
        onSave={async (updates) => {
          await updateAgent(editingAgent.id, updates);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingAgent}
        onClose={() => setDeletingAgent(null)}
        itemName={deletingAgent?.name}
        itemType="Agent"
        onConfirm={async () => {
          await deleteAgent(deletingAgent.id);
        }}
      />
    </div>
  );
};

