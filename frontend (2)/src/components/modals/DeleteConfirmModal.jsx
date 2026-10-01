import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  itemName = "",
  itemType = "record",
  warningMessage = "This action cannot be undone. It will permanently remove this record and update the audit log."
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '460px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ borderBottomColor: '#FEE2E2', background: '#FEF2F2' }}>
          <div className="modal-title" style={{ color: '#B91C1C' }}>
            <AlertTriangle size={20} style={{ color: '#DC2626' }} />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
            Are you sure you want to delete {itemType} <strong>{itemName}</strong>?
          </p>

          <div style={{
            background: '#FFF1F2',
            border: '1px solid #FECDD3',
            borderRadius: '6px',
            padding: '0.75rem',
            fontSize: '0.8rem',
            color: '#9F1239'
          }}>
            {warningMessage}
          </div>
        </div>

        <div className="modal-footer" style={{ background: '#F8FAFC' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="btn btn-danger btn-sm"
          >
            <Trash2 size={14} />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
