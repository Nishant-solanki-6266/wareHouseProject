import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ResponsiveTable } from '../../components/tables/ResponsiveTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ContainerFillBar } from '../../components/common/ContainerFillBar';
import { ContainerModal } from '../../components/modals/ContainerModal';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { Box, Layers, Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export const ContainersList = ({ onNavigate }) => {
  const { containers, createContainer, updateContainer, deleteContainer } = useAppData();
  const [editingContainer, setEditingContainer] = useState(null);
  const [deletingContainer, setDeletingContainer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const columns = [
    {
      header: 'Container Number',
      accessor: 'containerNumber',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 800, color: '#0A192F', fontFamily: 'JetBrains Mono, monospace' }}>
            {item.containerNumber}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.carrier}</div>
        </div>
      )
    },
    {
      header: 'Type & Specs',
      accessor: 'type',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{item.type}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
            Max Cap: {item.maxVolumeCbm} CBM • Tare: {item.tareWeightKg} kg
          </div>
        </div>
      )
    },
    {
      header: 'Seal Number',
      accessor: 'sealNumber',
      render: (item) => (
        <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: item.sealNumber === 'AVAILABLE' ? '#10B981' : '#D97706', fontSize: '0.8rem' }}>
          {item.sealNumber}
        </span>
      )
    },
    {
      header: 'Assigned Shipment',
      accessor: 'currentShipmentNumber',
      render: (item) => (
        item.currentShipmentId ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('shipments', item.currentShipmentId);
            }}
            style={{ fontWeight: 700, color: '#0284C7', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: '0.825rem' }}
          >
            {item.currentShipmentNumber}
          </button>
        ) : (
          <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Unassigned (Empty)</span>
        )
      )
    },
    {
      header: 'Load Fill & Volume',
      accessor: 'fillPercentage',
      render: (item) => (
        <div style={{ minWidth: '130px' }}>
          <ContainerFillBar
            fillPercentage={item.fillPercentage}
            currentCbm={item.loadedVolumeCbm}
            maxCbm={item.maxVolumeCbm}
            containerType={item.type}
          />
        </div>
      )
    },
    {
      header: 'Current Location',
      accessor: 'location',
      render: (item) => (
        <div style={{ fontSize: '0.78rem', color: '#334155' }}>
          {item.location}
        </div>
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
              setEditingContainer(item);
            }}
            className="btn btn-sm btn-secondary"
            title="Edit Container"
            style={{ padding: '0.25rem 0.45rem' }}
          >
            <Edit2 size={13} />
            <span className="hide-mobile">Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingContainer(item);
            }}
            className="btn btn-sm btn-ghost"
            title="Delete Container"
            style={{ padding: '0.25rem 0.45rem', color: '#EF4444' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Containers &amp; Equipment Fleet"
        subtitle="Track container serials, bolt seals, payload weights, and space utilization."
        icon={Box}
        breadcrumbs={[
          { label: 'Shipping', href: '#' },
          { label: 'Containers' }
        ]}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} />
            <span>Add Container Unit</span>
          </button>
        }
      />

      <ResponsiveTable
        columns={columns}
        data={containers}
        searchPlaceholder="Search container #, carrier, shipment, location..."
        filterOptions={['All', 'In Transit', 'Loaded & Sealed', 'Available at CFS Yard']}
        pageSize={8}
      />

      {/* Add Container Modal */}
      <ContainerModal
        isOpen={showAddModal}
        isEdit={false}
        onClose={() => setShowAddModal(false)}
        onSave={async (newContainerData) => {
          await createContainer(newContainerData);
        }}
      />

      {/* Edit Container Modal */}
      <ContainerModal
        isOpen={!!editingContainer}
        container={editingContainer}
        isEdit={true}
        onClose={() => setEditingContainer(null)}
        onSave={async (updates) => {
          await updateContainer(editingContainer.id, updates);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingContainer}
        onClose={() => setDeletingContainer(null)}
        itemName={deletingContainer?.containerNumber}
        itemType="Container"
        onConfirm={async () => {
          await deleteContainer(deletingContainer.id);
        }}
      />
    </div>
  );
};

