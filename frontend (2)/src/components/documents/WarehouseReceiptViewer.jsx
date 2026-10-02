import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { StatusBadge } from '../common/StatusBadge';
import { BarcodeVisual, QrVisual } from '../common/BarcodeVisual';
import { Printer, Download, Building2, FileText, Layers, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const WarehouseReceiptViewer = ({ receipt, onNavigate }) => {
  const { showToast } = useToast();

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
    showToast(`Print layout loaded for Warehouse Receipt ${receipt.receiptNumber}.`, 'info', 'Printing Receipt');
  };

  const pkgs = receipt.packages && receipt.packages.length > 0
    ? receipt.packages
    : [{
        id: `PKG-${receipt.receiptNumber}-01`,
        packageType: receipt.packageType || "Carton",
        description: receipt.cargoDescription || "General Cargo",
        lengthInches: receipt.lengthInches || 0,
        widthInches: receipt.widthInches || 0,
        heightInches: receipt.heightInches || 0,
        weightLbs: receipt.weightLbs || 0,
        pieces: receipt.totalPieces || receipt.packageCount || 1,
        cft: receipt.cft || 0,
        cbm: receipt.cbm || 0
      }];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Top Action Bar */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', background: '#FFFFFF', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <StatusBadge status={receipt.status} size="lg" />
          <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Date Received: <strong>{receipt.date} ({receipt.time || 'CFS Miami'})</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Receipt</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => showToast(`Warehouse Receipt ${receipt.receiptNumber}.pdf prepared.`, 'success', 'PDF Ready')}>
            <Download size={15} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Traceability Flow Bar */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '0.65rem 1rem', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '1rem', fontSize: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#64748B', fontWeight: 600 }}>Linked Customer:</span>
          {receipt.customerId && onNavigate ? (
            <button
              onClick={() => onNavigate('customers', receipt.customerId)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.15rem 0.4rem', color: '#0284C7', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Building2 size={13} />
              <span>{receipt.customer} ({receipt.customerId})</span>
            </button>
          ) : (
            <strong style={{ color: '#0A192F' }}>{receipt.customer}</strong>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {receipt.assignedHouseBillId ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#64748B', fontWeight: 600 }}>House B/L:</span>
              <button
                onClick={() => onNavigate && onNavigate('house-bills', receipt.assignedHouseBillId)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.15rem 0.4rem', color: '#2563EB', fontWeight: 700, fontSize: '0.8rem' }}
              >
                <FileText size={13} />
                <span>{receipt.assignedHouseBillId}</span>
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Ready for House B/L Linking
            </span>
          )}

          {receipt.assignedConsolidationId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#64748B', fontWeight: 600 }}>Consolidation:</span>
              <button
                onClick={() => onNavigate && onNavigate('consolidations', receipt.assignedConsolidationId)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.15rem 0.4rem', color: '#059669', fontWeight: 700, fontSize: '0.8rem' }}
              >
                <Layers size={13} />
                <span>{receipt.assignedConsolidationId}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Printable Receipt Layout */}
      <div
        className="card"
        style={{
          background: '#FFFFFF',
          border: '2px solid #0A192F',
          borderRadius: '4px',
          padding: '1.5rem',
          color: '#0A192F',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid #0A192F', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
          <div>
            <BrandLogo variant="dark" size="default" />
            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>
              CFS Miami Receiving Facility &amp; Cargo Hub<br />
              8400 NW 36th Street, Miami, FL 33166 | Tel: +1 (305) 555-5377
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0A192F' }}>
              WAREHOUSE RECEIPT
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#D97706' }}>
              {receipt.receiptNumber}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
              Destination Port: <strong style={{ color: '#0284C7' }}>{receipt.destinationPort}</strong>
            </div>
          </div>
        </div>

        {/* Customer & Shipper Box */}
        <div className="grid grid-cols-2 doc-grid-2" style={{ border: '1px solid #0A192F', marginBottom: '0.85rem' }}>
          <div style={{ padding: '0.65rem', borderRight: '1px solid #0A192F' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B' }}>SHIPPER / SUPPLIER ORIGIN</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>{receipt.shipper || 'Miami Industrial Supplier'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Customer Account: <strong>{receipt.customer}</strong></div>
          </div>
          <div style={{ padding: '0.65rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B' }}>CONSIGNEE &amp; DESTINATION AGENT</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>{receipt.consignee || receipt.customer}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Assigned Port Agent: <strong>{receipt.agentName || 'Caribbean Express Freight Ltd.'}</strong></div>
          </div>
        </div>

        {/* Individual Package-Level Items Table */}
        <div style={{ border: '1px solid #0A192F', marginBottom: '0.85rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ background: '#0A192F', color: '#FFFFFF', padding: '0.4rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Package-Level Inventory Breakdown ({pkgs.length} Line Items • {receipt.totalPieces || receipt.packageCount} Pieces Total)
          </div>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', color: '#0A192F', textAlign: 'left', fontSize: '0.65rem', textTransform: 'uppercase', borderBottom: '1px solid #CBD5E1' }}>
                <th style={{ padding: '0.45rem 0.5rem', width: '12%' }}>Pkg ID</th>
                <th style={{ padding: '0.45rem 0.5rem', width: '15%' }}>Type</th>
                <th style={{ padding: '0.45rem 0.5rem', width: '33%' }}>Description of Goods</th>
                <th style={{ padding: '0.45rem 0.5rem', width: '15%' }}>Dimensions (L×W×H)</th>
                <th style={{ padding: '0.45rem 0.5rem', width: '8%', textAlign: 'center' }}>Pieces</th>
                <th style={{ padding: '0.45rem 0.5rem', width: '8%', textAlign: 'right' }}>Weight</th>
                <th style={{ padding: '0.45rem 0.5rem', width: '9%', textAlign: 'right' }}>Volume</th>
              </tr>
            </thead>
            <tbody>
              {pkgs.map((p, idx) => (
                <tr key={p.id || idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                    {p.id || `PKG-${idx + 1}`}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>{p.packageType || 'Carton'}</span>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <div>{p.description || receipt.cargoDescription}</div>
                  </td>
                  <td style={{ padding: '0.5rem', color: '#475569' }}>
                    {p.lengthInches || receipt.lengthInches || 0}" × {p.widthInches || receipt.widthInches || 0}" × {p.heightInches || receipt.heightInches || 0}"
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700 }}>
                    {p.pieces || 1}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>
                    {p.weightLbs} lbs
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, color: '#0284C7' }}>
                    {p.cbm} CBM<br />
                    <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 400 }}>({p.cft} CFT)</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#F8FAFC', fontWeight: 800, borderTop: '2px solid #0A192F' }}>
                <td colSpan={4} style={{ padding: '0.5rem', textAlign: 'right' }}>RECEIPT TOTALS:</td>
                <td style={{ padding: '0.5rem', textAlign: 'center', color: '#0284C7' }}>{receipt.totalPieces || receipt.packageCount} PCS</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{receipt.weightLbs?.toLocaleString()} LBS</td>
                <td style={{ padding: '0.5rem', textAlign: 'right', color: '#D97706', fontWeight: 800 }}>{receipt.cft} CFT <span style={{ color: '#0284C7', fontWeight: 600 }}>({receipt.cbm} CBM)</span></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Cargo Remarks & Barcode Row */}
        <div className="grid grid-cols-2 doc-grid-2" style={{ border: '1px solid #0A192F', padding: '0.75rem', gap: '1rem', background: '#F8FAFC', marginBottom: '0.85rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B' }}>CARGO INTAKE STATUS &amp; REMARKS</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0A192F' }}>{receipt.status || 'Ready for Consolidation'}</div>
            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
              <strong>Notes:</strong> {receipt.notes || 'Goods inspected, measured and staged for consolidation.'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
            <BarcodeVisual value={receipt.barcode || receipt.receiptNumber} height={40} showText={true} />
            <QrVisual value={receipt.qrCode || receipt.receiptNumber} size={56} />
          </div>
        </div>

        {/* Receiving Certification Signature */}
        <div className="grid grid-cols-2 doc-grid-2" style={{ border: '1px solid #0A192F', padding: '0.75rem', gap: '1.5rem', background: '#FFFFFF', fontSize: '0.7rem' }}>
          <div>
            <div style={{ borderBottom: '1px solid #0A192F', paddingBottom: '0.4rem', marginBottom: '0.25rem', fontWeight: 700, color: '#0A192F' }}>
              Carlos Mendez (CFS Receiving Clerk)
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
              RECEIVED BY VI CFS OPERATIONS
            </div>
          </div>
          <div>
            <div style={{ borderBottom: '1px solid #0A192F', paddingBottom: '0.4rem', marginBottom: '0.25rem', fontWeight: 700, color: '#0A192F' }}>
              Deliverer / Driver Signature
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
              DELIVERING CARRIER SIGNATURE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
