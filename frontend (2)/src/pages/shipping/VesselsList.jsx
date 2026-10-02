import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ResponsiveTable } from '../../components/tables/ResponsiveTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { VesselModal } from '../../components/modals/VesselModal';
import { VoyageModal } from '../../components/modals/VoyageModal';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { Anchor, Ship, Calendar, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export const VesselsList = ({ onNavigate }) => {
  const { vessels, voyages, createVessel, updateVessel, deleteVessel, createVoyage, updateVoyage, deleteVoyage } = useAppData();

  const [showAddVessel, setShowAddVessel] = useState(false);
  const [editingVessel, setEditingVessel] = useState(null);
  const [deletingVessel, setDeletingVessel] = useState(null);

  const [showAddVoyage, setShowAddVoyage] = useState(false);
  const [editingVoyage, setEditingVoyage] = useState(null);
  const [deletingVoyage, setDeletingVoyage] = useState(null);

  const vesselColumns = [
    {
      header: 'Vessel Name',
      accessor: 'name',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0A192F', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Anchor size={15} style={{ color: '#0284C7' }} />
            <span>{item.name}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>IMO: {item.imoNumber} • Flag: {item.flag}</div>
        </div>
      )
    },
    {
      header: 'Vessel Type & Carrier',
      accessor: 'type',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{item.type}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.carrier}</div>
        </div>
      )
    },
    {
      header: 'Capacity & Dimensions',
      accessor: 'capacityTeu',
      render: (item) => (
        <div>
          <strong>{item.capacityTeu !== undefined ? item.capacityTeu : 0} TEU</strong> • <span style={{ color: '#0284C7', fontWeight: 600 }}>{item.lengthFeet || 110} ft</span>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.deadweightTonnage?.toLocaleString()} DWT</div>
        </div>
      )
    },
    {
      header: 'Active Voyage & Route',
      accessor: 'activeRoute',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0284C7' }}>{item.currentVoyage}</div>
          <div style={{ fontSize: '0.72rem', color: '#334155' }}>{item.activeRoute}</div>
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
              setEditingVessel(item);
            }}
            className="btn btn-sm btn-secondary"
            title="Edit Vessel"
            style={{ padding: '0.25rem 0.45rem' }}
          >
            <Edit2 size={13} />
            <span className="hide-mobile">Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingVessel(item);
            }}
            className="btn btn-sm btn-ghost"
            title="Delete Vessel"
            style={{ padding: '0.25rem 0.45rem', color: '#EF4444' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Vessels &amp; Ocean Voyages"
        subtitle="Carrier schedules, feeder vessel rotations, and Caribbean route tracking."
        icon={Anchor}
        breadcrumbs={[
          { label: 'Shipping', href: '#' },
          { label: 'Vessels & Voyages' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowAddVoyage(true)}
              className="btn btn-outline btn-sm"
            >
              <Calendar size={15} />
              <span>Schedule Voyage</span>
            </button>
            <button
              onClick={() => setShowAddVessel(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={15} />
              <span>Register Vessel</span>
            </button>
          </div>
        }
      />

      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#0A192F', margin: 0 }}>Vessel Fleet Directory</h3>
          <button
            onClick={() => setShowAddVessel(true)}
            className="btn btn-sm btn-primary"
          >
            <Plus size={13} />
            <span>Add Vessel</span>
          </button>
        </div>
        <ResponsiveTable
          columns={vesselColumns}
          data={vessels}
          searchPlaceholder="Search vessel name, IMO, carrier, route..."
          pageSize={5}
        />
      </div>

      {/* Voyages Schedule Table */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#0A192F', margin: 0 }}>Active Voyage Schedules</h3>
          <button
            onClick={() => setShowAddVoyage(true)}
            className="btn btn-sm btn-primary"
          >
            <Plus size={13} />
            <span>Schedule Voyage</span>
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Voyage #</th>
                <th>Vessel</th>
                <th>Origin Port</th>
                <th>Discharge Port</th>
                <th>Departure Date</th>
                <th>Arrival Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {voyages.map(voy => (
                <tr key={voy.id}>
                  <td style={{ fontWeight: 700, color: '#0A192F', fontFamily: 'JetBrains Mono, monospace' }}>{voy.voyageNumber}</td>
                  <td style={{ fontWeight: 600 }}>{voy.vesselName}</td>
                  <td>{voy.originPort}</td>
                  <td style={{ fontWeight: 700, color: '#0284C7' }}>{voy.destinationPort}</td>
                  <td>{voy.departureDate}</td>
                  <td>{voy.arrivalDate}</td>
                  <td><StatusBadge status={voy.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setEditingVoyage(voy)}
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '0.2rem 0.45rem' }}
                        title="Edit Voyage"
                      >
                        <Edit2 size={13} />
                        <span className="hide-mobile">Edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingVoyage(voy)}
                        className="btn btn-sm btn-ghost"
                        style={{ padding: '0.2rem 0.45rem', color: '#EF4444' }}
                        title="Delete Voyage"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Vessel Modal */}
      <VesselModal
        isOpen={showAddVessel}
        isEdit={false}
        onClose={() => setShowAddVessel(false)}
        onSave={async (newVesselData) => {
          await createVessel(newVesselData);
        }}
      />
      <VesselModal
        isOpen={!!editingVessel}
        vessel={editingVessel}
        isEdit={true}
        onClose={() => setEditingVessel(null)}
        onSave={async (updates) => {
          await updateVessel(editingVessel.id, updates);
        }}
      />
      <DeleteConfirmModal
        isOpen={!!deletingVessel}
        onClose={() => setDeletingVessel(null)}
        itemName={deletingVessel?.name}
        itemType="Vessel"
        onConfirm={async () => {
          await deleteVessel(deletingVessel.id);
        }}
      />

      {/* Add / Edit Voyage Modal */}
      <VoyageModal
        isOpen={showAddVoyage}
        isEdit={false}
        onClose={() => setShowAddVoyage(false)}
        onSave={async (newVoyageData) => {
          await createVoyage(newVoyageData);
        }}
      />
      <VoyageModal
        isOpen={!!editingVoyage}
        voyage={editingVoyage}
        isEdit={true}
        onClose={() => setEditingVoyage(null)}
        onSave={async (updates) => {
          await updateVoyage(editingVoyage.id, updates);
        }}
      />
      <DeleteConfirmModal
        isOpen={!!deletingVoyage}
        onClose={() => setDeletingVoyage(null)}
        itemName={deletingVoyage?.voyageNumber}
        itemType="Voyage"
        onConfirm={async () => {
          await deleteVoyage(deletingVoyage.id);
        }}
      />
    </div>
  );
};

