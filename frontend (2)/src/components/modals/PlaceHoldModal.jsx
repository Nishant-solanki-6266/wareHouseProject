import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HOLD_REASONS = [
  "Payment Pending: Freight & Documentation Charges Unsettled",
  "Customs Hold: Destination Port Inspection Required",
  "Documentation Missing: Commercial Invoice / Packing List Incomplete",
  "Consignee Credit Limit Exceeded",
  "Shipper Instruction: Do Not Release Cargo",
  "Damaged Cargo Discrepancy under Investigation",
  "Administrative Review Required"
];

export const PlaceHoldModal = ({ isOpen, onClose, bl, onConfirm }) => {
  const { currentUser } = useAuth();
  const [selectedReason, setSelectedReason] = useState(HOLD_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [holdNotes, setHoldNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !bl) return null;

  const handlePlaceHold = async () => {
    const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
    if (!finalReason) return;

    setIsSubmitting(true);
    try {
      await onConfirm(bl.id || bl.blNumber, finalReason, holdNotes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#FFFBEB', borderBottomColor: '#FDE68A' }}>
          <div className="modal-title" style={{ color: '#92400E' }}>
            <ShieldAlert size={22} style={{ color: '#D97706' }} />
            <span>Place Bill of Lading ON HOLD — {bl.blNumber}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={15} /> Hold Impact Notice
            </div>
            <div style={{ fontSize: '0.78rem', color: '#7F1D1D', marginTop: '0.25rem', lineHeight: 1.4 }}>
              Placing this B/L On Hold will immediately restrict document access in the Agent Portal and prevent cargo release at the discharge port until an authorized clearance is recorded.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Reason for Hold <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
            >
              {HOLD_REASONS.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
              <option value="Other">Other / Custom Reason...</option>
            </select>
          </div>

          {selectedReason === 'Other' && (
            <div className="form-group">
              <label className="form-label">
                Specify Custom Hold Reason <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter specific hold reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Detailed Hold Instructions &amp; Action Required
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Provide instructions for operations staff, accounting, or destination agents..."
              value={holdNotes}
              onChange={(e) => setHoldNotes(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Placed by Officer</label>
            <input
              type="text"
              className="form-control"
              value={`${currentUser?.name} (${currentUser?.role})`}
              disabled
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={handlePlaceHold}
            disabled={isSubmitting || (selectedReason === 'Other' && !customReason.trim())}
          >
            <ShieldAlert size={16} />
            <span>{isSubmitting ? 'Placing Hold...' : 'Confirm & Place On Hold'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
