import React, { useState, useEffect } from 'react';
import { Box, X, Save, Plus } from 'lucide-react';

export const ContainerModal = ({
  isOpen,
  onClose,
  onSave,
  container = null,
  isEdit = false
}) => {
  const [formData, setFormData] = useState({
    containerNumber: '',
    type: '40ft High Cube Dry',
    carrier: 'MSC Mediterranean',
    maxVolumeCbm: 76.2,
    tareWeightKg: 3900,
    sealNumber: 'AVAILABLE',
    currentShipmentNumber: '',
    loadedVolumeCbm: 0,
    fillPercentage: 0,
    location: 'Miami CFS Yard',
    status: 'Available at CFS Yard'
  });

  useEffect(() => {
    if (container && isEdit) {
      setFormData({
        containerNumber: container.containerNumber || '',
        type: container.type || '40ft High Cube Dry',
        carrier: container.carrier || 'MSC Mediterranean',
        maxVolumeCbm: container.maxVolumeCbm || 76.2,
        tareWeightKg: container.tareWeightKg || 3900,
        sealNumber: container.sealNumber || 'AVAILABLE',
        currentShipmentNumber: container.currentShipmentNumber || '',
        loadedVolumeCbm: container.loadedVolumeCbm || 0,
        fillPercentage: container.fillPercentage || 0,
        location: container.location || 'Miami CFS Yard',
        status: container.status || 'Available at CFS Yard'
      });
    } else {
      setFormData({
        containerNumber: `MEDU${Math.floor(1000000 + Math.random() * 9000000)}`,
        type: '40ft High Cube Dry',
        carrier: 'MSC Mediterranean',
        maxVolumeCbm: 76.2,
        tareWeightKg: 3900,
        sealNumber: 'AVAILABLE',
        currentShipmentNumber: '',
        loadedVolumeCbm: 0,
        fillPercentage: 0,
        location: 'Miami CFS Yard',
        status: 'Available at CFS Yard'
      });
    }
  }, [container, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (type) => {
    let maxCbm = 76.2;
    let tare = 3900;
    if (type === '20ft Standard Dry') { maxCbm = 33.2; tare = 2200; }
    else if (type === '40ft Standard Dry') { maxCbm = 67.7; tare = 3700; }
    else if (type === '45ft High Cube Dry') { maxCbm = 86.0; tare = 4800; }
    else if (type === '40ft Reefer High Cube') { maxCbm = 67.0; tare = 4500; }

    const loaded = Number(formData.loadedVolumeCbm) || 0;
    const fill = Math.min(100, Math.round((loaded / maxCbm) * 100));

    setFormData({
      ...formData,
      type,
      maxVolumeCbm: maxCbm,
      tareWeightKg: tare,
      fillPercentage: fill
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const maxCbm = Number(formData.maxVolumeCbm) || 76.2;
    const loaded = Number(formData.loadedVolumeCbm) || 0;
    const fill = Math.min(100, Math.round((loaded / maxCbm) * 100));

    onSave({
      ...formData,
      maxVolumeCbm: maxCbm,
      tareWeightKg: Number(formData.tareWeightKg) || 3900,
      loadedVolumeCbm: loaded,
      fillPercentage: fill
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Box size={20} style={{ color: '#0A192F' }} />
            <span>{isEdit ? `Edit Container ${formData.containerNumber}` : 'Add Container to Fleet'}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '72vh', overflowY: 'auto' }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Container Serial Number <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  disabled={isEdit}
                  className="form-control"
                  placeholder="e.g. MEDU7891234"
                  value={formData.containerNumber}
                  onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ocean Carrier / Owner</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Container Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  <option value="40ft High Cube Dry">40ft High Cube Dry (76.2 CBM)</option>
                  <option value="40ft Standard Dry">40ft Standard Dry (67.7 CBM)</option>
                  <option value="20ft Standard Dry">20ft Standard Dry (33.2 CBM)</option>
                  <option value="45ft High Cube Dry">45ft High Cube Dry (86.0 CBM)</option>
                  <option value="40ft Reefer High Cube">40ft Reefer High Cube</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Max Payload Volume (CBM)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formData.maxVolumeCbm}
                  onChange={(e) => setFormData({ ...formData, maxVolumeCbm: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tare Weight (kg)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.tareWeightKg}
                  onChange={(e) => setFormData({ ...formData, tareWeightKg: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Bolt Seal Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. BOLT-99281 or AVAILABLE"
                  value={formData.sealNumber}
                  onChange={(e) => setFormData({ ...formData, sealNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Shipment #</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. SHP-2026-292 or leave empty"
                  value={formData.currentShipmentNumber}
                  onChange={(e) => setFormData({ ...formData, currentShipmentNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Loaded Volume (CBM)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="form-control"
                  value={formData.loadedVolumeCbm}
                  onChange={(e) => {
                    const loaded = Number(e.target.value) || 0;
                    const max = Number(formData.maxVolumeCbm) || 76.2;
                    setFormData({
                      ...formData,
                      loadedVolumeCbm: loaded,
                      fillPercentage: Math.min(100, Math.round((loaded / max) * 100))
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Yard Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Miami CFS Yard Bay 4"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Container Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Available at CFS Yard">Available at CFS Yard</option>
                  <option value="Loaded & Sealed">Loaded & Sealed</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Discharged / Empty Depot">Discharged / Empty Depot</option>
                  <option value="Maintenance / Inspection">Maintenance / Inspection</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              {isEdit ? <Save size={14} /> : <Plus size={14} />}
              <span>{isEdit ? 'Save Container Changes' : 'Add Container'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
