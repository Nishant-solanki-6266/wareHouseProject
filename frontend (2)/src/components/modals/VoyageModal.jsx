import React, { useState, useEffect } from 'react';
import { Calendar, X, Save, Plus } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export const VoyageModal = ({
  isOpen,
  onClose,
  onSave,
  voyage = null,
  isEdit = false
}) => {
  const { ports, vessels } = useAppData();
  const defaultOrigin = ports.find(p => p.code === 'MIA') ? 'MIA - Port of Miami' : (ports[0] ? `${ports[0].code} - ${ports[0].name}` : 'MIA - Port of Miami');
  const defaultDest = ports[0] ? `${ports[0].code} - ${ports[0].name}` : 'NAS - Nassau Container Port';

  const [formData, setFormData] = useState({
    voyageNumber: '',
    vesselName: vessels[0]?.name || 'M/V Caribbean Voyager',
    originPort: defaultOrigin,
    destinationPort: defaultDest,
    departureDate: '2026-09-02',
    arrivalDate: '2026-09-06',
    carrier: 'Tropical Shipping',
    status: 'Scheduled'
  });

  useEffect(() => {
    if (voyage && isEdit) {
      setFormData({
        voyageNumber: voyage.voyageNumber || '',
        vesselName: voyage.vesselName || (vessels[0]?.name || 'M/V Caribbean Voyager'),
        originPort: voyage.originPort || defaultOrigin,
        destinationPort: voyage.destinationPort || defaultDest,
        departureDate: voyage.departureDate || '2026-09-02',
        arrivalDate: voyage.arrivalDate || '2026-09-06',
        carrier: voyage.carrier || 'Tropical Shipping',
        status: voyage.status || 'Scheduled'
      });
    } else {
      setFormData({
        voyageNumber: `VOY-2026-${Math.floor(100 + Math.random() * 900)}`,
        vesselName: vessels[0]?.name || 'M/V Caribbean Voyager',
        originPort: defaultOrigin,
        destinationPort: defaultDest,
        departureDate: new Date().toISOString().split('T')[0],
        arrivalDate: '2026-09-06',
        carrier: 'Tropical Shipping',
        status: 'Scheduled'
      });
    }
  }, [voyage, isEdit, isOpen, defaultOrigin, defaultDest, vessels]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Calendar size={20} style={{ color: '#0284C7' }} />
            <span>{isEdit ? `Edit Voyage ${formData.voyageNumber}` : 'Schedule New Ocean Voyage'}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Voyage Number <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  disabled={isEdit}
                  className="form-control"
                  value={formData.voyageNumber}
                  onChange={(e) => setFormData({ ...formData, voyageNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Vessel <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.vesselName}
                  onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Origin Port</label>
                <select
                  className="form-select"
                  value={formData.originPort}
                  onChange={(e) => setFormData({ ...formData, originPort: e.target.value })}
                >
                  {ports.map(p => (
                    <option key={`vyg-orig-${p.id || p.code}`} value={`${p.code} - ${p.name}`}>
                      {p.code} — {p.name} ({p.island || p.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Discharge / Destination Port <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={formData.destinationPort}
                  onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                  required
                >
                  {ports.map(p => (
                    <option key={`vyg-dest-${p.id || p.code}`} value={`${p.code} - ${p.name}`}>
                      {p.code} — {p.name} ({p.island || p.country})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Departure Date (ETD)</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Arrival Date (ETA)</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Carrier</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Voyage Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Loading">Loading</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Arrived">Arrived</option>
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
              {isEdit ? <Save size={14} /> : <Plus size={14} />}
              <span>{isEdit ? 'Save Voyage' : 'Schedule Voyage'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
