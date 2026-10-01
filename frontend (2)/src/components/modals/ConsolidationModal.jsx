import React, { useState, useEffect } from 'react';
import { Layers, X, Save } from 'lucide-react';

export const ConsolidationModal = ({
  isOpen,
  onClose,
  onSave,
  consolidation = null
}) => {
  const [formData, setFormData] = useState({
    title: '',
    containerNumber: '',
    sealNumber: '',
    containerType: '40ft High Cube Dry',
    vesselName: '',
    voyageNumber: '',
    carrier: 'Tropical Shipping',
    destinationPort: 'NAS - Nassau, Bahamas',
    status: 'Loaded'
  });

  useEffect(() => {
    if (consolidation) {
      setFormData({
        title: consolidation.title || '',
        containerNumber: consolidation.containerNumber || '',
        sealNumber: consolidation.sealNumber || '',
        containerType: consolidation.containerType || '40ft High Cube Dry',
        vesselName: consolidation.vesselName || '',
        voyageNumber: consolidation.voyageNumber || '',
        carrier: consolidation.carrier || 'Tropical Shipping',
        destinationPort: consolidation.destinationPort || 'NAS - Nassau, Bahamas',
        status: consolidation.status || 'Loaded'
      });
    }
  }, [consolidation, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Layers size={20} style={{ color: '#1E4D8C' }} />
            <span>Edit Consolidation {consolidation?.consolidationNumber}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '72vh', overflowY: 'auto' }}>
            <div className="form-group">
              <label className="form-label">Consolidation Title <span className="required">*</span></label>
              <input
                type="text"
                required
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Container Number <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.containerNumber}
                  onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bolt Seal Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.sealNumber}
                  onChange={(e) => setFormData({ ...formData, sealNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Container Type</label>
                <select
                  className="form-select"
                  value={formData.containerType}
                  onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
                >
                  <option value="40ft High Cube Dry">40ft High Cube Dry (76.2 CBM)</option>
                  <option value="40ft Standard Dry">40ft Standard Dry (67.7 CBM)</option>
                  <option value="20ft Standard Dry">20ft Standard Dry (33.2 CBM)</option>
                  <option value="45ft High Cube Dry">45ft High Cube Dry (86.0 CBM)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Vessel Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.vesselName}
                  onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Voyage Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.voyageNumber}
                  onChange={(e) => setFormData({ ...formData, voyageNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ocean Carrier</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Destination Port</label>
                <select
                  className="form-select"
                  value={formData.destinationPort}
                  onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                >
                  <option value="NAS - Nassau, Bahamas">NAS - Nassau, Bahamas</option>
                  <option value="FPO - Freeport, Grand Bahama">FPO - Freeport, Grand Bahama</option>
                  <option value="GCM - George Town, Grand Cayman">GCM - George Town, Grand Cayman</option>
                  <option value="BGI - Bridgetown, Barbados">BGI - Bridgetown, Barbados</option>
                  <option value="KIN - Kingston, Jamaica">KIN - Kingston, Jamaica</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Consolidation Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Loaded">Loaded</option>
                  <option value="Sealed">Sealed</option>
                  <option value="Draft">Draft</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Save size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
