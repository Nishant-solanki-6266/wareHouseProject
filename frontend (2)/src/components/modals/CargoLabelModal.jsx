import React, { useState } from 'react';
import { X, Printer, Download, Check } from 'lucide-react';
import { CargoLabel4x6 } from '../documents/CargoLabel4x6';
import { useToast } from '../../context/ToastContext';

export const CargoLabelModal = ({ isOpen, onClose, cargo }) => {
  const { showToast } = useToast();
  const [pieceIndex, setPieceIndex] = useState(1);
  const totalPieces = cargo?.totalPieces || cargo?.packageCount || 1;

  if (!isOpen || !cargo) return null;

  const handlePrint = () => {
    window.print();
    showToast(`Print job sent for Cargo Label ${cargo.id || cargo.receiptNumber}.`, 'success', 'Print Started');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Printer size={20} style={{ color: '#0284C7' }} />
            <span>Cargo Label Preview (4" × 6" Thermal Roll)</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ background: '#F1F5F9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          {totalPieces > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Select Piece Label:
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {Array.from({ length: Math.min(totalPieces, 8) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPieceIndex(idx + 1)}
                    className={`btn btn-sm ${pieceIndex === idx + 1 ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    Piece {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: '1rem', background: '#E2E8F0', borderRadius: '12px', overflowX: 'auto', maxWidth: '100%' }}>
            <CargoLabel4x6
              cargo={cargo}
              pieceIndex={pieceIndex}
              totalPieces={totalPieces}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print 4x6 Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};
