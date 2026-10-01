import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MasterBLViewer } from '../../components/documents/MasterBLViewer';
import { FileText, ArrowLeft, Lock, AlertTriangle, PhoneCall, Mail, Download, Printer, Shield } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';

export const AgentBLDetail = ({ blId, onNavigate }) => {
  const { billsOfLading, shipments } = useAppData();
  const { showToast } = useToast();

  const bl = billsOfLading.find(b => b.id === blId || b.blNumber === blId || b.shipmentId === blId);

  if (!bl) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h3>Bill of Lading Not Found</h3>
        <button onClick={() => onNavigate('agent-documents')} className="btn btn-primary btn-sm mt-4">
          Back to Documents
        </button>
      </div>
    );
  }

  const isOnHold = bl.status === 'On Hold' || bl.holdDetails?.isOnHold;

  const handleAttemptDownload = () => {
    if (isOnHold) {
      showToast(
        `Action Restricted: Master B/L ${bl.blNumber} is currently ON HOLD. Contact Head Office for payment/customs clearance.`,
        'danger',
        'Access Blocked'
      );
    } else {
      showToast(`Master B/L ${bl.blNumber}.pdf downloaded.`, 'success', 'Document Downloaded');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1100px', margin: '0 auto' }}>
      <PageHeader
        title={`Bill of Lading ${bl.blNumber}`}
        subtitle={`Destination Port: ${bl.portOfDischarge} • Consignee: ${bl.consignee?.name}`}
        icon={FileText}
        breadcrumbs={[
          { label: 'Agent Portal', href: '#' },
          { label: 'Documents', href: '#' },
          { label: bl.blNumber }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('agent-documents')} className="btn btn-outline btn-sm">
              <ArrowLeft size={15} />
              <span>Back to Documents</span>
            </button>
            <button
              onClick={handleAttemptDownload}
              className={`btn btn-sm ${isOnHold ? 'btn-danger' : 'btn-primary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {isOnHold ? <Lock size={14} /> : <Download size={14} />}
              <span>{isOnHold ? 'Document Locked (On Hold)' : 'Download Official PDF'}</span>
            </button>
          </div>
        }
      />

      {/* CRITICAL AGENT HOLD RESTRICTION BANNER */}
      {isOnHold ? (
        <div
          className="hold-banner-danger"
          style={{
            background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
            border: '2px solid #EF4444',
            borderRadius: '8px',
            padding: '1.25rem',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#EF4444',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Lock size={22} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#991B1B', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={18} />
                  <span>BILL OF LADING IS CURRENTLY ON HOLD BY HEAD OFFICE</span>
                </h3>
                <span style={{ background: '#DC2626', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                  RELEASE RESTRICTED
                </span>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#7F1D1D', marginBottom: '0.65rem' }}>
                <strong>Reason:</strong> {bl.holdDetails?.reason || 'Payment Pending / Customs Review Required'}
              </div>

              {bl.holdDetails?.holdNotes && (
                <div style={{ background: 'rgba(255, 255, 255, 0.75)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#334155', marginBottom: '0.75rem', border: '1px solid #FECACA' }}>
                  <strong>Hold Notice:</strong> {bl.holdDetails.holdNotes}
                </div>
              )}

              <div style={{ fontSize: '0.8rem', color: '#991B1B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                <Lock size={14} /> Cargo release and document retrieval are strictly locked. Destination agents cannot clear this hold directly.
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', borderTop: '1px dashed rgba(220, 38, 38, 0.3)', paddingTop: '0.65rem', fontSize: '0.8rem', color: '#1E293B' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PhoneCall size={14} style={{ color: '#0284C7' }} /> Head Office Hotline: <strong>+1 (305) 555-5377 (Ext 4)</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={14} style={{ color: '#0284C7' }} /> Accounts &amp; Holds: <strong>accounting@vicustoms.com</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.85rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#166534' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
            <Shield size={18} style={{ color: '#16A34A' }} />
            <span>Master Bill of Lading is OFFICIAL RELEASED and cleared for destination discharge.</span>
          </div>
          <button onClick={handleAttemptDownload} className="btn btn-sm btn-success">
            <Download size={14} />
            <span>Download Official B/L</span>
          </button>
        </div>
      )}

      {/* Embedded Master B/L View */}
      <MasterBLViewer bl={bl} />
    </div>
  );
};
