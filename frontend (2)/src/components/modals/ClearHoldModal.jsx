import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ClearHoldModal = ({ isOpen, onClose, bl, onConfirm }) => {
  const { currentUser } = useAuth();
  const [clearNotes, setClearNotes] = useState('Payment verified & accounting release approved.');
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !bl) return null;

  const handleClear = async () => {
    if (!confirmed) return;
    setIsSubmitting(true);
    try {
      await onConfirm(bl.id || bl.blNumber, clearNotes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#F0FDF4', borderBottomColor: '#BBF7D0' }}>
          <div className="modal-title" style={{ color: '#166534' }}>
            <ShieldCheck size={22} style={{ color: '#16A34A' }} />
            <span>Authorize Hold Clearance &amp; B/L Release</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#92400E', marginBottom: '0.25rem' }}>
              Current Hold on B/L: {bl.blNumber}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#78350F' }}>
              <strong>Active Reason:</strong> {bl.holdDetails?.reason || 'Payment Pending'}
            </div>
            {bl.holdDetails?.placedBy && (
              <div style={{ fontSize: '0.75rem', color: '#92400E', marginTop: '0.25rem' }}>
                Placed by {bl.holdDetails.placedBy} on {bl.holdDetails.placedAt}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Authorizing Officer
            </label>
            <input
              type="text"
              className="form-control"
              value={`${currentUser?.name} (${currentUser?.role})`}
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Release &amp; Clearance Notes <span className="required">*</span>
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Enter authorization reference (e.g. Wire confirmation #, credit approval notes)..."
              value={clearNotes}
              onChange={(e) => setClearNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '1rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <input
              type="checkbox"
              id="confirm-hold-clear"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <label htmlFor="confirm-hold-clear" style={{ fontSize: '0.8rem', color: '#334155', cursor: 'pointer', lineHeight: 1.4 }}>
              I certify that all commercial, compliance, and freight charges have been settled and authorize immediate status change to <strong>RELEASED</strong>.
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="btn btn-success"
            onClick={handleClear}
            disabled={!confirmed || !clearNotes.trim() || isSubmitting}
          >
            <CheckCircle2 size={16} />
            <span>{isSubmitting ? 'Clearing Hold...' : 'Confirm Hold Clearance'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
