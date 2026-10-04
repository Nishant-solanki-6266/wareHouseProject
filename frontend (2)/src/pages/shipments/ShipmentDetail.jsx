import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { HoldAlertBanner } from '../../components/common/HoldAlertBanner';
import { ContainerFillBar } from '../../components/common/ContainerFillBar';
import { MasterBLViewer } from '../../components/documents/MasterBLViewer';
import { CargoLabelModal } from '../../components/modals/CargoLabelModal';
import { ClearHoldModal } from '../../components/modals/ClearHoldModal';
import { PlaceHoldModal } from '../../components/modals/PlaceHoldModal';
import { ShipmentModal } from '../../components/modals/ShipmentModal';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import {
  Ship,
  ArrowLeft,
  Package,
  FileText,
  Box,
  Compass,
  Activity,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Anchor,
  FileStack,
  Edit2,
  Trash2
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { shipmentService } from '../../services/shipmentService';
import { WorkflowIndicator } from '../../components/common/WorkflowIndicator';

export const ShipmentDetail = ({ shipmentId, onNavigate }) => {
  const { shipments, warehouseReceipts, billsOfLading, containers, clearBLHold, placeBLHold, updateShipment, deleteShipment } = useAppData();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCargoForLabel, setSelectedCargoForLabel] = useState(null);
  const [showClearHoldModal, setShowClearHoldModal] = useState(false);
  const [showPlaceHoldModal, setShowPlaceHoldModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [liveShipment, setLiveShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (shipmentId) {
      setIsLoading(true);
      shipmentService.getShipmentById(shipmentId)
        .then(res => {
          if (isMounted && res) {
            setLiveShipment(res);
          }
        })
        .catch(err => console.warn('[ShipmentDetail] Live fetch note:', err))
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [shipmentId]);

  const activeShipment = liveShipment || shipments.find(s => s.id === shipmentId || s.shipmentNumber === shipmentId || s.trackingNumber === shipmentId);
  const shipment = activeShipment;

  if (!shipment && isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h3>Loading Shipment...</h3>
        <p style={{ color: '#64748B' }}>Fetching live shipment data from database...</p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h3>Shipment Not Found</h3>
        <button onClick={() => onNavigate('shipments')} className="btn btn-primary btn-sm mt-4">
          Back to Shipments List
        </button>
      </div>
    );
  }

  // Linked entities
  const linkedReceipts = (shipment.linkedReceipts && shipment.linkedReceipts.length > 0)
    ? shipment.linkedReceipts
    : warehouseReceipts.filter(r =>
        shipment.warehouseReceiptIds?.includes(r.id) || 
        shipment.warehouseReceiptIds?.includes(r.receiptNumber) || 
        r.assignedShipmentId === shipment.id ||
        r.assignedShipmentId === shipment.shipmentNumber
      );
  const linkedBL = shipment.linkedBL || billsOfLading.find(b => 
    b.id === shipment.billOfLadingId || 
    b.blNumber === shipment.billOfLadingNumber || 
    b.shipmentId === shipment.id ||
    b.shipmentId === shipment.shipmentNumber
  );
  const linkedContainer = containers.find(c => c.containerNumber === shipment.containerNumber);

  const isHoldActive = linkedBL?.status === 'On Hold' || linkedBL?.holdDetails?.isOnHold || shipment.blStatus === 'On Hold';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1400px', margin: '0 auto' }}>
      <PageHeader
        title={`Shipment ${shipment.shipmentNumber}`}
        subtitle={`${shipment.origin} → ${shipment.destinationPort} via ${shipment.vesselName} (${shipment.voyageNumber})`}
        icon={Ship}
        breadcrumbs={[
          { label: 'Shipments', href: '#' },
          { label: shipment.shipmentNumber }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('shipments')}
              className="btn btn-outline btn-sm"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
            <button
              onClick={() => onNavigate('tracking', shipment.trackingNumber)}
              className="btn btn-outline btn-sm"
            >
              <Compass size={15} />
              <span>Live Tracking</span>
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-secondary btn-sm"
            >
              <Edit2 size={15} />
              <span>Edit Shipment</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger btn-sm"
            >
              <Trash2 size={15} />
              <span>Delete Shipment</span>
            </button>
            {linkedBL && (
              <button
                onClick={() => onNavigate('bills-of-lading', linkedBL.id)}
                className="btn btn-primary btn-sm"
              >
                <FileText size={15} />
                <span>View Master B/L</span>
              </button>
            )}
          </div>
        }
      />

      {/* Primary Workflow Journey Indicator */}
      <WorkflowIndicator currentStage="shipments" onStageClick={(stageId) => onNavigate(stageId)} />

      {/* Status + Next Step Action Guide */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '0.875rem 1.25rem',
        background: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: '#16A34A',
            color: '#FFFFFF',
            borderRadius: '6px',
            padding: '0.35rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            CURRENT STATUS: {shipment.status?.toUpperCase() || 'BOOKED'}
          </div>
          <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
            Next Step: Prepare Bill of Lading & Port Manifest for customs clearance
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {linkedBL ? (
            <button
              onClick={() => onNavigate('bills-of-lading', linkedBL.id)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              Review Master B/L &rarr;
            </button>
          ) : (
            <button
              onClick={() => onNavigate('bills-of-lading')}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              View Bills of Lading &rarr;
            </button>
          )}
          <button
            onClick={() => onNavigate('manifests')}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.8rem', background: '#FFFFFF' }}
          >
            Create Manifest
          </button>
        </div>
      </div>

      {/* Prominent B/L Hold Warning if On Hold */}
      {isHoldActive && linkedBL && (
        <HoldAlertBanner
          blNumber={linkedBL.blNumber}
          holdDetails={linkedBL.holdDetails}
          onClearHoldClick={() => setShowClearHoldModal(true)}
        />
      )}

      {/* Shipment Status & Highlights Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Tracking #</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284C7', fontFamily: 'JetBrains Mono, monospace' }}>
                {shipment.trackingNumber}
              </div>
            </div>

            <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Current Stage</div>
              <StatusBadge status={shipment.status} size="lg" />
            </div>

            <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>B/L Status</div>
              <StatusBadge status={linkedBL?.status || shipment.blStatus} size="lg" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: '#64748B' }}>ETD (Dep):</span> <strong>{shipment.etd}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>ETA (Arr):</span> <strong style={{ color: '#0284C7' }}>{shipment.eta}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        {[
          { id: 'overview', label: 'Overview', icon: Ship },
          { id: 'cargo', label: `Cargo Items (${linkedReceipts.length})`, icon: Package },
          { id: 'bl', label: 'Master Bill of Lading', icon: FileText },
          { id: 'container', label: 'Container & Fleet', icon: Box },
          { id: 'documents', label: 'Documents', icon: FileStack },
          { id: 'tracking', label: 'Tracking Checkpoints', icon: Compass },
          { id: 'activity', label: 'Activity & Audit', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-12 gap-5">
          <div style={{ gridColumn: 'span 8' }} className="col-span-8-mobile">
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#0A192F', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                Shipment Profile &amp; Route Logistics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Port of Loading (Origin)</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0A192F' }}>{shipment.origin}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Port of Discharge (Destination)</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0284C7' }}>{shipment.destinationPort}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Ocean Vessel</div>
                  <div style={{ fontWeight: 700 }}>{shipment.vesselName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Voyage Number</div>
                  <div style={{ fontWeight: 700 }}>{shipment.voyageNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Ocean Carrier</div>
                  <div style={{ fontWeight: 700 }}>{shipment.carrier}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Container Number</div>
                  <div style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{shipment.containerNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Bolt Seal Number</div>
                  <div style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{shipment.sealNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Assigned Port Agent</div>
                  <div style={{ fontWeight: 700 }}>{shipment.agentName}</div>
                </div>
              </div>

              {/* Total Aggregate Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }} className="grid-cols-4-mobile">
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>PACKAGES</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A192F' }}>{shipment.totalPackages}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>GROSS WEIGHT</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A192F' }}>{shipment.totalWeightLbs?.toLocaleString()} lbs</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>VOLUME (CBM)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284C7' }}>{shipment.totalCbm} CBM</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>VOLUME (CFT)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706' }}>{shipment.totalCft} CFT</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Current Live Position</div>
                <div style={{ fontSize: '0.85rem', color: '#0A192F', background: '#F1F5F9', padding: '0.6rem 0.85rem', borderRadius: '6px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} style={{ color: '#0284C7' }} />
                  <span>{shipment.currentLocation}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ gridColumn: 'span 4' }} className="col-span-4-mobile">
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#0A192F' }}>B/L &amp; Commercial Actions</h3>

              <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Master B/L:</span>
                  <strong style={{ fontFamily: 'JetBrains Mono, monospace', color: '#0A192F' }}>{linkedBL?.blNumber || shipment.billOfLadingNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Status:</span>
                  <StatusBadge status={linkedBL?.status || shipment.blStatus} />
                </div>
              </div>

              {/* Hold Controls Demo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {isHoldActive ? (
                  <button
                    onClick={() => setShowClearHoldModal(true)}
                    className="btn btn-success w-full"
                    style={{ justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Authorize &amp; Clear Hold</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPlaceHoldModal(true)}
                    className="btn btn-danger w-full"
                    style={{ justifyContent: 'center' }}
                  >
                    <AlertTriangle size={16} />
                    <span>Place B/L On Hold</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('bl')}
                  className="btn btn-outline w-full"
                  style={{ justifyContent: 'center' }}
                >
                  <FileText size={16} />
                  <span>Open Master B/L Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CARGO ITEMS */}
      {activeTab === 'cargo' && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A192F' }}>
              Consolidated Warehouse Receipts ({linkedReceipts.length} Intake Lots)
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Customer</th>
                  <th>Description</th>
                  <th>Packages</th>
                  <th>Weight (LBS)</th>
                  <th>Volume (CFT / CBM)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {linkedReceipts.map(wr => (
                  <tr key={wr.id}>
                    <td style={{ fontWeight: 700, color: '#D97706', fontFamily: 'JetBrains Mono, monospace' }}>
                      {wr.receiptNumber}
                    </td>
                    <td style={{ fontWeight: 600 }}>{wr.customer}</td>
                    <td style={{ fontSize: '0.8rem' }}>{wr.cargoDescription}</td>
                    <td style={{ fontWeight: 600 }}>{wr.packageCount} {wr.packageType}</td>
                    <td>{wr.weightLbs} lbs</td>
                    <td style={{ fontWeight: 700, color: '#D97706' }}>{wr.cft} CFT <span style={{ color: '#0284C7', fontWeight: 600 }}>({wr.cbm} CBM)</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => setSelectedCargoForLabel(wr)}
                          className="btn btn-sm btn-outline"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <Printer size={12} />
                          <span>4x6 Label</span>
                        </button>
                        <button
                          onClick={() => onNavigate('warehouse-receipts', wr.id || wr.receiptNumber)}
                          className="btn btn-sm btn-primary"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <span>Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MASTER BILL OF LADING */}
      {activeTab === 'bl' && (
        <div>
          {linkedBL ? (
            <MasterBLViewer bl={linkedBL} />
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <FileText size={36} style={{ color: '#94A3B8' }} />
              <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>No B/L Attached</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CONTAINER */}
      {activeTab === 'container' && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0A192F', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
            Container &amp; Equipment Details
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Container Number</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0A192F', fontFamily: 'JetBrains Mono, monospace' }}>
                {shipment.containerNumber}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Bolt Seal Number</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#D97706', fontFamily: 'JetBrains Mono, monospace' }}>
                {shipment.sealNumber}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Container Type</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{shipment.containerType}</div>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#0A192F', marginBottom: '0.75rem' }}>
              Space Utilization &amp; Payload
            </h4>
            <ContainerFillBar
              fillPercentage={Number(((shipment.totalCbm / (linkedContainer?.maxVolumeCbm || 76.2)) * 100).toFixed(1))}
              currentCbm={shipment.totalCbm}
              maxCbm={linkedContainer?.maxVolumeCbm || 76.2}
              containerType={shipment.containerType}
              containerNumber={shipment.containerNumber}
            />
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0A192F' }}>Associated Shipping Documents</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} style={{ color: '#0284C7' }} />
                <div>
                  <strong>Master Bill of Lading ({linkedBL?.blNumber || shipment.billOfLadingNumber})</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Official Master Document</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StatusBadge status={linkedBL?.status || shipment.blStatus} />
                <button
                  onClick={() => setActiveTab('bl')}
                  className="btn btn-sm btn-primary"
                  disabled={isHoldActive}
                >
                  <Download size={13} />
                  <span>{isHoldActive ? 'Locked (On Hold)' : 'Download PDF'}</span>
                </button>
              </div>
            </div>

            {linkedReceipts.map(wr => (
              <div key={wr.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Package size={20} style={{ color: '#D97706' }} />
                  <div>
                    <strong>Warehouse Receipt {wr.receiptNumber}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{wr.customer} • {wr.packageCount} {wr.packageType}</div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('warehouse-receipts', wr.id || wr.receiptNumber)}
                  className="btn btn-sm btn-outline"
                >
                  <span>View Receipt</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: TRACKING CHECKPOINTS */}
      {activeTab === 'tracking' && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#0A192F' }}>Live Milestones &amp; Tracking Checkpoints</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
              Tracking Reference: <strong>{shipment.trackingNumber}</strong>
            </p>
          </div>

          <div className="tracking-timeline">
            {(shipment.trackingCheckpoints || []).map((chk, idx) => (
              <div
                key={chk.id || idx}
                className={`timeline-item ${chk.status === 'Completed' ? 'completed' : chk.status === 'Active' ? 'active' : ''}`}
              >
                <div className="timeline-marker">
                  {chk.status === 'Completed' && <CheckCircle2 size={12} />}
                  {chk.status === 'Active' && <Anchor size={12} />}
                  {chk.status === 'Pending' && <Clock size={10} />}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="timeline-title">{chk.stage}</span>
                  <span className="timeline-time">{chk.date} {chk.time ? `• ${chk.time}` : ''}</span>
                </div>

                {chk.location && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284C7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {chk.location}
                  </div>
                )}

                <div className="timeline-desc">{chk.notes}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: ACTIVITY & AUDIT */}
      {activeTab === 'activity' && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0A192F' }}>Shipment Activity Log</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
            <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <strong>Shipment Registered</strong> on {shipment.createdDate} by Marcus Vance (Operations).
            </div>
            <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <strong>Container Sealed</strong> ({shipment.sealNumber}) loaded onto {shipment.vesselName}.
            </div>
            {isHoldActive && (
              <div style={{ padding: '0.75rem', background: '#FEF2F2', borderRadius: '6px', border: '1px solid #FECACA', color: '#991B1B' }}>
                <strong>B/L On Hold:</strong> {linkedBL?.holdDetails?.reason || 'Payment verification pending'}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <CargoLabelModal
        isOpen={!!selectedCargoForLabel}
        onClose={() => setSelectedCargoForLabel(null)}
        cargo={selectedCargoForLabel}
      />

      <ClearHoldModal
        isOpen={showClearHoldModal}
        onClose={() => setShowClearHoldModal(false)}
        bl={linkedBL}
        onConfirm={async (id, notes) => {
          await clearBLHold(id, notes);
        }}
      />

      <PlaceHoldModal
        isOpen={showPlaceHoldModal}
        onClose={() => setShowPlaceHoldModal(false)}
        bl={linkedBL}
        onConfirm={async (id, reason, notes) => {
          await placeBLHold(id, reason, notes);
        }}
      />

      {/* Edit Shipment Modal */}
      <ShipmentModal
        isOpen={showEditModal}
        shipment={shipment}
        isEdit={true}
        onClose={() => setShowEditModal(false)}
        onSave={async (updates) => {
          await updateShipment(shipment.id || shipment.shipmentNumber, updates);
          const refreshed = await shipmentService.getShipmentById(shipment.id || shipment.shipmentNumber);
          if (refreshed) setLiveShipment(refreshed);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        itemName={shipment.shipmentNumber}
        itemType="Shipment"
        onConfirm={async () => {
          await deleteShipment(shipment.id || shipment.shipmentNumber);
          onNavigate('shipments');
        }}
      />
    </div>
  );
};
