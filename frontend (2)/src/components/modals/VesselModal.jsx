import React, { useState, useEffect } from 'react';
import { Anchor, X, Save, Plus } from 'lucide-react';

export const VesselModal = ({
  isOpen,
  onClose,
  onSave,
  vessel = null,
  isEdit = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    imoNumber: '',
    carrier: 'Island Merchant Line',
    type: 'Merchant Vessel / Island Trader (80-120 ft)',
    lengthFeet: 110,
    capacityTeu: 10,
    deadweightTonnage: 350,
    flag: 'Bahamas (BHS)',
    activeRoute: 'Miami → Bahamas Out-Islands Loop',
    currentVoyage: 'VOY-2026-088',
    status: 'In Port (Loading)'
  });

  useEffect(() => {
    if (vessel && isEdit) {
      setFormData({
        name: vessel.name || '',
        imoNumber: vessel.imoNumber || '',
        carrier: vessel.carrier || 'Island Merchant Line',
        type: vessel.type || 'Merchant Vessel / Island Trader (80-120 ft)',
        lengthFeet: vessel.lengthFeet || 110,
        capacityTeu: vessel.capacityTeu !== undefined ? vessel.capacityTeu : 10,
        deadweightTonnage: vessel.deadweightTonnage !== undefined ? vessel.deadweightTonnage : 350,
        flag: vessel.flag || 'Bahamas (BHS)',
        activeRoute: vessel.activeRoute || 'Miami → Bahamas Out-Islands Loop',
        currentVoyage: vessel.currentVoyage || 'VOY-2026-088',
        status: vessel.status || 'At Sea (In Transit)'
      });
    } else {
      setFormData({
        name: '',
        imoNumber: `IMO-${Math.floor(9000000 + Math.random() * 999999)}`,
        carrier: 'Island Merchant Line',
        type: 'Merchant Vessel / Island Trader (80-120 ft)',
        lengthFeet: 110,
        capacityTeu: 10,
        deadweightTonnage: 350,
        flag: 'Bahamas (BHS)',
        activeRoute: 'Miami → Bahamas Out-Islands Loop',
        currentVoyage: `VOY-2026-${Math.floor(100 + Math.random() * 900)}`,
        status: 'In Port (Loading)'
      });
    }
  }, [vessel, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      lengthFeet: Number(formData.lengthFeet) || 0,
      capacityTeu: Number(formData.capacityTeu) || 0,
      deadweightTonnage: Number(formData.deadweightTonnage) || 0
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Anchor size={20} style={{ color: '#0284C7' }} />
            <span>{isEdit ? `Edit Vessel ${formData.name}` : 'Register New Merchant / Ocean Vessel'}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '72vh', overflowY: 'auto' }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Vessel Name <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. M/V Island Trader, Lady Rosalind"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official IMO / Registration Number <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. IMO-9382910 or REG-BS-4421"
                  value={formData.imoNumber}
                  onChange={(e) => setFormData({ ...formData, imoNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Operating Carrier / Owner</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Island Merchant Line, Tropical Shipping"
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vessel Classification / Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Merchant Vessel / Island Trader (80-120 ft)">Merchant Vessel / Island Trader (80-120 ft)</option>
                  <option value="Coastal Breakbulk Freighter">Coastal Breakbulk Freighter</option>
                  <option value="Small Cargo Feeder / Mailboat">Small Cargo Feeder / Mailboat</option>
                  <option value="Geared Feeder Container Vessel">Geared Feeder Container Vessel</option>
                  <option value="Cellular Container Ship">Cellular Container Ship</option>
                  <option value="Ro-Ro / Container Carrier">Ro-Ro / Container Carrier</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Vessel Length (Feet)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 95 (ft)"
                  className="form-control"
                  value={formData.lengthFeet}
                  onChange={(e) => setFormData({ ...formData, lengthFeet: e.target.value })}
                />
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                  Small merchant vessels: 80–120 ft.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Container Capacity (TEU)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="e.g. 0 to 50 TEU"
                  value={formData.capacityTeu}
                  onChange={(e) => setFormData({ ...formData, capacityTeu: e.target.value })}
                />
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                  Can be 0 or small (e.g. 2-20 TEU).
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deadweight (DWT / Tons)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 250"
                  className="form-control"
                  value={formData.deadweightTonnage}
                  onChange={(e) => setFormData({ ...formData, deadweightTonnage: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Flag State</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Bahamas (BHS)"
                  value={formData.flag}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Active Island Route</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Miami → Nassau → Abaco"
                  value={formData.activeRoute}
                  onChange={(e) => setFormData({ ...formData, activeRoute: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Voyage #</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. VOY-2026-088"
                  value={formData.currentVoyage}
                  onChange={(e) => setFormData({ ...formData, currentVoyage: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Operational Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="At Sea (In Transit)">At Sea (In Transit)</option>
                <option value="In Port (Discharging)">In Port (Discharging)</option>
                <option value="In Port (Loading)">In Port (Loading)</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Drydock / Maintenance">Drydock / Maintenance</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              {isEdit ? <Save size={14} /> : <Plus size={14} />}
              <span>{isEdit ? 'Save Vessel Changes' : 'Register Vessel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
