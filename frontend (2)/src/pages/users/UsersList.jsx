import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ResponsiveTable } from '../../components/tables/ResponsiveTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UserModal } from '../../components/modals/UserModal';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { ShieldCheck, UserPlus, Shield, Check, X, Edit2, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';

const ROLE_NAME_MAP = {
  super_admin: 'Super Admin',
  operations: 'Operations Coordinator',
  warehouse: 'Warehouse Staff',
  documentation: 'Documentation Staff',
  agent: 'Destination Agent'
};

export const UsersList = ({ onNavigate }) => {
  const { usersList, rolesList, currentUser, switchUser } = useAuth();
  const { createUser, updateUser, deleteUser } = useAppData();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'matrix'
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const enrichedUsers = useMemo(() => {
    return (usersList || []).map(u => ({
      ...u,
      role: u.role || ROLE_NAME_MAP[u.roleKey] || (u.roleKey ? u.roleKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Staff Member')
    }));
  }, [usersList]);

  const userColumns = [
    {
      header: 'Staff Member',
      accessor: 'name',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: item.roleKey === 'agent' ? '#D97706' : '#0A192F',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.75rem'
          }}>
            {item.avatar || (item.name ? item.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U')}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0A192F' }}>{item.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Assigned Role',
      accessor: 'role',
      render: (item) => (
        <span style={{ fontWeight: 600, color: '#0284C7' }}>
          {item.role || ROLE_NAME_MAP[item.roleKey] || item.roleKey || 'Staff Member'}
        </span>
      )
    },
    {
      header: 'Department / Facility',
      accessor: 'department',
      render: (item) => (
        <span style={{ fontSize: '0.8rem', color: '#334155' }}>{item.department}</span>
      )
    },
    {
      header: 'Last Login',
      accessor: 'lastLogin',
      render: (item) => (
        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.lastLogin || 'Recent'}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => <StatusBadge status={item.status || 'Active'} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              switchUser(item.id);
              if (item.roleKey === 'agent') onNavigate('agent-dashboard');
              else onNavigate('dashboard');
            }}
            className="btn btn-sm btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.45rem' }}
            title="Log in / switch to this persona"
          >
            <span>Switch</span>
          </button>
          <button
            onClick={() => setEditingUser(item)}
            className="btn btn-sm btn-secondary"
            title="Edit User Profile"
            style={{ padding: '0.25rem 0.45rem' }}
          >
            <Edit2 size={13} />
            <span className="hide-mobile">Edit</span>
          </button>
          <button
            onClick={() => setDeletingUser(item)}
            className="btn btn-sm btn-ghost"
            title="Delete User Account"
            style={{ padding: '0.25rem 0.45rem', color: '#EF4444' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Users, Roles &amp; Permissions Matrix"
        subtitle="Manage administrative profiles, operations staff permissions, and agent portal access."
        icon={ShieldCheck}
        breadcrumbs={[
          { label: 'Management', href: '#' },
          { label: 'Users & Roles' }
        ]}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
          >
            <UserPlus size={15} />
            <span>Add Staff Account</span>
          </button>
        }
      />

      <div className="tabs-container">
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          <span>Staff &amp; User Accounts ({enrichedUsers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
        >
          <span>Role Permissions Matrix</span>
        </button>
      </div>

      {activeTab === 'users' ? (
        <ResponsiveTable
          columns={userColumns}
          data={enrichedUsers}
          searchPlaceholder="Search staff member, role, email..."
          pageSize={6}
        />
      ) : (
        /* Granular Permissions Matrix */
        <div className="card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1rem', color: '#0A192F', marginBottom: '0.75rem' }}>
            System Access &amp; Operational Permissions Matrix
          </h3>

          <table className="data-table" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Functional Module</th>
                {rolesList.map(r => (
                  <th key={r.roleKey} style={{ textAlign: 'center' }}>
                    <div>{r.roleName}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 400 }}>{r.userCount} users</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Warehouse Receipts: View &amp; Intake</strong></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
              </tr>
              <tr>
                <td><strong>Cargo Consolidation Engine</strong></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
              </tr>
              <tr>
                <td><strong>Bill of Lading: Issue &amp; Edit</strong></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
              </tr>
              <tr style={{ background: '#FFFBEB' }}>
                <td><strong style={{ color: '#92400E' }}>Place / Clear B/L Hold (Authorization)</strong></td>
                <td style={{ textAlign: 'center', color: '#10B981', fontWeight: 800 }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
                <td style={{ textAlign: 'center', color: '#10B981', fontWeight: 800 }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
              </tr>
              <tr>
                <td><strong>Generate Shipping Manifests</strong></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
              </tr>
              <tr>
                <td><strong>Dedicated Agent Portal Access</strong></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
                <td style={{ textAlign: 'center', color: '#10B981', fontWeight: 800 }}><Check size={16} /></td>
              </tr>
              <tr>
                <td><strong>Audit Trail Logs Inspection</strong></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
                <td style={{ textAlign: 'center', color: '#10B981' }}><Check size={16} /></td>
                <td style={{ textAlign: 'center', color: '#EF4444' }}><X size={16} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      <UserModal
        isOpen={showAddModal}
        isEdit={false}
        onClose={() => setShowAddModal(false)}
        onSave={async (newUserData) => {
          await createUser(newUserData);
        }}
      />

      {/* Edit User Modal */}
      <UserModal
        isOpen={!!editingUser}
        user={editingUser}
        isEdit={true}
        onClose={() => setEditingUser(null)}
        onSave={async (updates) => {
          await updateUser(editingUser.id, updates);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        itemName={deletingUser?.name}
        itemType="User Account"
        onConfirm={async () => {
          await deleteUser(deletingUser.id);
        }}
      />
    </div>
  );
};

