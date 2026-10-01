import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { MasterBLViewer } from '../../components/documents/MasterBLViewer';
import { HoldAlertBanner } from '../../components/common/HoldAlertBanner';
import { ClearHoldModal } from '../../components/modals/ClearHoldModal';
import { PlaceHoldModal } from '../../components/modals/PlaceHoldModal';
import { BillOfLadingModal } from '../../components/modals/BillOfLadingModal';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import {
  FileText,
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  Ship,
  Printer,
  Download,
  Edit2,
  Trash2,
  Layers,
  ExternalLink,
  Package,
  AlertTriangle
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { WorkflowIndicator } from '../../components/common/WorkflowIndicator';

export const BillOfLadingDetail = ({ blId, onNavigate }) => {
  const { billsOfLading, houseBills, clearBLHold, placeBLHold, updateBillOfLading, deleteBillOfLading } = useAppData();
  const { isAgent } = useAuth();

  const [showClearModal, setShowClearModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const bl = billsOfLading.find(b => b.id === blId || b.blNumber === blId);

  if (!bl) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h3>Bill of Lading Not Found</h3>
        <button onClick={() => onNavigate('bills-of-lading')} className="btn btn-primary btn-sm mt-4">
          Back to B/L List
        </button>
      </div>
    );
  }

  const isOnHold = bl.status === 'On Hold' || bl.holdDetails?.isOnHold;

  // Retrieve linked House Bills
  const linkedHbls = houseBills.filter(
    h => bl.houseBillIds?.includes(h.id) || bl.houseBillIds?.includes(h.hblNumber) || h.assignedMasterBLId === bl.id || h.assignedMasterBLId === bl.blNumber
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1100px', margin: '0 auto' }}>
      <PageHeader
        title={`Master Bill of Lading ${bl.blNumber}`}
        subtitle={`Consigned to ${bl.consignee?.name} via ${bl.oceanVessel} (${bl.portOfDischarge})`}
        icon={FileText}
        breadcrumbs={[
          { label: 'Bills of Lading', href: '#' },
          { label: bl.blNumber }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('bills-of-lading')}
              className="btn btn-outline btn-sm"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
            {bl.shipmentId && (
              <button
                onClick={() => onNavigate('shipments', bl.shipmentId)}
                className="btn btn-outline btn-sm"
              >
                <Ship size={15} />
                <span>View Shipment</span>
              </button>
            )}
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-secondary btn-sm"
            >
              <Edit2 size={15} />
              <span>Edit B/L</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger btn-sm"
            >
              <Trash2 size={15} />
              <span>Delete B/L</span>
            </button>
            {!isAgent && bl.status !== 'Cancelled' && (
              <>
                {isOnHold ? (
                  <button
                    onClick={() => setShowClearModal(true)}
                    className="btn btn-success btn-sm"
                  >
                    <CheckCircle2 size={15} />
                    <span>Clear Hold &amp; Release B/L</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPlaceModal(true)}
                    className="btn btn-warning btn-sm"
                  >
                    <ShieldAlert size={15} />
                    <span>Place B/L On Hold</span>
                  </button>
                )}
              </>
            )}
          </div>
        }
      />

      {/* Primary Workflow Journey Indicator */}
      <WorkflowIndicator currentStage="bills-of-lading" onStageClick={(stageId) => onNavigate(stageId)} />

      {/* Status + Next Step Action Guide */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '0.875rem 1.25rem',
        background: isOnHold ? '#FEF2F2' : '#F0FDF4',
        border: `1px solid ${isOnHold ? '#FECACA' : '#BBF7D0'}`,
        borderRadius: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: isOnHold ? '#DC2626' : '#16A34A',
            color: '#FFFFFF',
            borderRadius: '6px',
            padding: '0.35rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            CURRENT STATUS: {bl.status?.toUpperCase() || 'DRAFT'}
          </div>
          <span style={{ fontSize: '0.85rem', color: isOnHold ? '#991B1B' : '#166534', fontWeight: 600 }}>
            {isOnHold
              ? `Hold Active: ${bl.holdDetails?.reason || 'Requires supervisor resolution before release'}`
              : bl.status === 'Released'
              ? 'Ready for Customs Port Manifest generation & Destination Agent clearance'
              : 'Review cargo & shipper details, link House B/Ls, then release'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isOnHold ? (
            <button
              onClick={() => setShowClearModal(true)}
              className="btn btn-danger btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              Clear Hold
            </button>
          ) : (
            <button
              onClick={() => onNavigate('manifests')}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              Generate Manifest &rarr;
            </button>
          )}
          <button
            onClick={() => onNavigate('house-bills')}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.8rem', background: '#FFFFFF' }}
          >
            Manage House B/Ls
          </button>
        </div>
      </div>

      {/* Cancelled B/L Banner */}
      {bl.status === 'Cancelled' && (
        <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
          <AlertTriangle size={20} style={{ color: '#64748B', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#0F172A' }}>Master B/L Cancelled &amp; Voided:</strong> This Bill of Lading has been cancelled and cannot be cleared, released or dispatched for delivery.
          </div>
        </div>
      )}

      {/* Prominent Hold Warning Banner */}
      {isOnHold && (
        <HoldAlertBanner
          blNumber={bl.blNumber}
          holdDetails={bl.holdDetails}
          onClearHoldClick={() => setShowClearModal(true)}
        />
      )}

      {/* Authentic Master B/L Document Layout */}
      <MasterBLViewer bl={bl} linkedHbls={linkedHbls} onNavigate={onNavigate} />

      {/* Linked House Bills of Lading Explorer Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} style={{ color: '#2563EB' }} />
            <h3 style={{ fontSize: '1rem', color: '#0A192F', margin: 0 }}>
              Consolidated House Bills of Lading in this Master B/L ({linkedHbls.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigate('house-bills')}
            className="btn btn-sm btn-outline"
            style={{ fontSize: '0.78rem' }}
          >
            + View / Manage House B/Ls
          </button>
        </div>

        {linkedHbls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B', fontSize: '0.85rem' }}>
            No individual House B/Ls linked directly. (FCL / Direct Carrier Booking)
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>House B/L #</th>
                  <th>Customer / Shipper</th>
                  <th>Consignee</th>
                  <th>Cargo Description</th>
                  <th>Linked WRs</th>
                  <th>Total Pieces</th>
                  <th>Gross Weight</th>
                  <th>Volume (CBM)</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {linkedHbls.map(hbl => (
                  <tr
                    key={hbl.id}
                    onClick={() => onNavigate('house-bills', hbl.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 800, color: '#2563EB', fontFamily: 'JetBrains Mono, monospace' }}>
                      {hbl.hblNumber}
                    </td>
                    <td>{hbl.customerName}</td>
                    <td>{typeof hbl.consignee === 'object' ? hbl.consignee.name : hbl.consignee}</td>
                    <td style={{ fontSize: '0.78rem', color: '#334155' }}>{hbl.cargoDescription}</td>
                    <td><strong style={{ color: '#D97706' }}>{hbl.warehouseReceiptIds?.length || 1}</strong> WRs</td>
                    <td style={{ fontWeight: 700 }}>{hbl.totalPieces || hbl.totalPackages} pcs</td>
                    <td>{hbl.totalWeightLbs?.toLocaleString()} lbs</td>
                    <td style={{ fontWeight: 700, color: '#0284C7' }}>{hbl.totalCbm} CBM</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('house-bills', hbl.id);
                        }}
                        className="btn btn-sm btn-ghost"
                        style={{ color: '#2563EB' }}
                      >
                        <ExternalLink size={13} />
                        <span className="hide-mobile">View HBL</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Master B/L Modal */}
      <BillOfLadingModal
        isOpen={showEditModal}
        bl={bl}
        isEdit={true}
        onClose={() => setShowEditModal(false)}
        onSave={async (updates) => {
          await updateBillOfLading(bl.id, updates);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        itemName={bl.blNumber}
        itemType="Bill of Lading"
        onConfirm={async () => {
          await deleteBillOfLading(bl.id);
          onNavigate('bills-of-lading');
        }}
      />

      {/* Hold Modals */}
      <ClearHoldModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        bl={bl}
        onConfirm={async (id, notes) => {
          await clearBLHold(id, notes);
        }}
      />

      <PlaceHoldModal
        isOpen={showPlaceModal}
        onClose={() => setShowPlaceModal(false)}
        bl={bl}
        onConfirm={async (id, reason, notes) => {
          await placeBLHold(id, reason, notes);
        }}
      />
    </div>
  );
};
