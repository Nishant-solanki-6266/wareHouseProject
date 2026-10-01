import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Save, Plus } from 'lucide-react';

export const UserModal = ({
  isOpen,
  onClose,
  onSave,
  user = null,
  isEdit = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleKey: 'operations',
    role: 'Operations Coordinator',
    department: 'Operations & Freight Logistics',
    status: 'Active'
  });

  const roles = [
    { key: 'super_admin', name: 'Super Admin', department: 'Executive Management & Administration' },
    { key: 'operations', name: 'Operations Coordinator', department: 'Operations & Freight Logistics' },
    { key: 'warehouse', name: 'Warehouse Staff', department: 'CFS Warehouse & Cargo Receiving' },
    { key: 'documentation', name: 'Documentation Specialist', department: 'Customs & Documentation' },
    { key: 'agent', name: 'Destination Port Agent', department: 'Caribbean Agent Network' }
  ];

  useEffect(() => {
    if (user && isEdit) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        roleKey: user.roleKey || 'operations',
        role: user.role || 'Operations Coordinator',
        department: user.department || 'Operations & Freight Logistics',
        status: user.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        roleKey: 'operations',
        role: 'Operations Coordinator',
        department: 'Operations & Freight Logistics',
        status: 'Active'
      });
    }
  }, [user, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = (roleKey) => {
    const found = roles.find(r => r.key === roleKey);
    if (found) {
      setFormData({
        ...formData,
        roleKey: found.key,
        role: found.name,
        department: found.department
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <ShieldCheck size={20} style={{ color: '#0A192F' }} />
            <span>{isEdit ? `Edit Staff Account (${formData.name})` : 'Add New Staff User Account'}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Alex Morgan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="e.g. alex.morgan@vicustoms.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Role &amp; Permission Tier</label>
              <select
                className="form-select"
                value={formData.roleKey}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                {roles.map(r => (
                  <option key={r.key} value={r.key}>{r.name} ({r.department})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department / Facility</label>
              <input
                type="text"
                className="form-control"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              {isEdit ? <Save size={14} /> : <Plus size={14} />}
              <span>{isEdit ? 'Save User Changes' : 'Create User Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
