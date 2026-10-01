import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ResponsiveTable } from '../../components/tables/ResponsiveTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { WorkflowIndicator } from '../../components/common/WorkflowIndicator';
import { CargoLabelModal } from '../../components/modals/CargoLabelModal';
import { WarehouseReceiptModal } from '../../components/modals/WarehouseReceiptModal';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import {
  Package,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export const WarehouseReceiptsList = ({ onNavigate }) => {
  const { warehouseReceipts, updateWarehouseReceipt, deleteWarehouseReceipt } = useAppData();
  const [labelCargo, setLabelCargo] = useState(null);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [deletingReceipt, setDeletingReceipt] = useState(null);

  const columns = [
    {
      header: 'Receipt #',
      accessor: 'receiptNumber',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, color: '#D97706', fontFamily: 'JetBrains Mono, monospace' }}>
            {item.receiptNumber}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
            {item.date} ({item.time})
          </div>
        </div>
      )
    },
    {
      header: 'Customer & Consignee',
      accessor: 'customer',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0A192F' }}>{item.customer}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.consignee}
          </div>
        </div>
      )
    },
    {
      header: 'Packages & Cargo',
      accessor: 'packageCount',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{item.packageCount} {item.packageType}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.cargoDescription}
          </div>
        </div>
      )
    },
    {
      header: 'Weight / Volume',
      accessor: 'weightLbs',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{item.weightLbs?.toLocaleString()} lbs</div>
          <div style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: 600 }}>
            {item.cbm} CBM ({item.cft} CFT)
          </div>
        </div>
      )
    },
    {
      header: 'Destination Port',
      accessor: 'destinationPort',
      render: (item) => (
        <div>
          <span style={{ fontWeight: 700, color: '#0A192F' }}>{item.destinationCode}</span>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.destinationPort}</div>
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
              onNavigate('warehouse-receipts', item.id);
            }}
            className="btn btn-sm btn-primary"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
          >
            <Eye size={13} />
            <span>View</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLabelCargo(item);
            }}
            className="btn btn-sm btn-outline"
            title="Print 4x6 Cargo Thermal Roll Label"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            <Printer size={13} />
            <span>Label</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingReceipt(item);
            }}
            className="btn btn-sm btn-secondary"
            title="Edit Warehouse Receipt"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            <Edit2 size={13} />
            <span className="hide-mobile">Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingReceipt(item);
            }}
            className="btn btn-sm btn-ghost"
            title="Delete Warehouse Receipt"
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
        title="Warehouse Receipts"
        subtitle="Record cargo received at the CFS and generate warehouse receipt numbers and labels."
        icon={Package}
        breadcrumbs={[
          { label: 'Operations', href: '#' },
          { label: 'Warehouse Receipts' }
        ]}
        actions={
          <button
            onClick={() => onNavigate('warehouse-receipts', 'create')}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} />
            <span>Create Warehouse Receipt</span>
          </button>
        }
      />

      <WorkflowIndicator currentStage="warehouse-receipts" onNavigate={onNavigate} />

      {/* Main Table with Clear Empty State */}
      <ResponsiveTable
        columns={columns}
        data={warehouseReceipts}
        searchPlaceholder="Search by receipt #, customer, cargo, destination..."
        filterOptions={['All', 'Ready for Consolidation', 'Received', 'Consolidated']}
        pageSize={8}
        emptyTitle="No Warehouse Receipts Found"
        emptyWhy="No intake receipts match your search or filter."
        emptyNextStep="Record incoming cargo from a customer or shipper to add it to the consolidation queue."
        emptyActionLabel="+ Create Warehouse Receipt"
        onEmptyAction={() => onNavigate('warehouse-receipts', 'create')}
        onRowClick={(item) => onNavigate('warehouse-receipts', item.id)}
      />

      {/* 4x6 Roll Label Print Modal */}
      <CargoLabelModal
        isOpen={!!labelCargo}
        onClose={() => setLabelCargo(null)}
        cargo={labelCargo}
      />

      {/* Edit Modal */}
      <WarehouseReceiptModal
        isOpen={!!editingReceipt}
        receipt={editingReceipt}
        onClose={() => setEditingReceipt(null)}
        onSave={async (updates) => {
          await updateWarehouseReceipt(editingReceipt.id, updates);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingReceipt}
        onClose={() => setDeletingReceipt(null)}
        itemName={deletingReceipt?.receiptNumber}
        itemType="Warehouse Receipt"
        onConfirm={async () => {
          await deleteWarehouseReceipt(deletingReceipt.id);
        }}
      />
    </div>
  );
};

