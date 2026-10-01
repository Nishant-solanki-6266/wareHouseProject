import React, { useState } from 'react';
import { BrandLogo } from '../../components/common/BrandLogo';
import {
  Shield,
  Ship,
  Package,
  FileText,
  Users,
  Layers,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  Anchor,
  Box,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = ({ onLoginSuccess }) => {
  const { login, usersList } = useAuth();
  const { showToast } = useToast();

  const [selectedUser, setSelectedUser] = useState(usersList[0]);
  const [email, setEmail] = useState(usersList[0].email);
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPersona = (u) => {
    setSelectedUser(u);
    setEmail(u.email);
    setPassword('password123');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const loggedUser = login(email, password);
      setIsLoading(false);
      showToast(
        `Welcome back, ${loggedUser.name}! Logged in as ${loggedUser.role}.`,
        'success',
        'Authentication Successful'
      );
      if (onLoginSuccess) {
        onLoginSuccess(loggedUser);
      }
    }, 400);
  };

  const handleQuickLogin = (u) => {
    setIsLoading(true);
    setTimeout(() => {
      const loggedUser = login(u.id);
      setIsLoading(false);
      showToast(
        `Signed in as ${loggedUser.name} (${loggedUser.role}).`,
        'success',
        'Portal Access Granted'
      );
      if (onLoginSuccess) {
        onLoginSuccess(loggedUser);
      }
    }, 300);
  };

  const workflowOrder = ['USR-003', 'USR-005', 'USR-002', 'USR-004', 'USR-001'];
  const sortedUsers = [...usersList].sort((a, b) => {
    const idxA = workflowOrder.indexOf(a.id);
    const idxB = workflowOrder.indexOf(b.id);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  const roleDetails = {
    'USR-003': {
      title: 'Warehouse',
      shortLabel: 'Warehouse',
      category: 'Cargo Intake',
      badgeColor: '#D97706',
      icon: Package,
      summary: 'Receive cargo, measure dimensions & print labels'
    },
    'USR-005': {
      title: 'Operations',
      shortLabel: 'Ops',
      category: 'Consolidation',
      badgeColor: '#059669',
      icon: Ship,
      summary: 'Consolidate cargo into containers & book shipments'
    },
    'USR-002': {
      title: 'Documentation',
      shortLabel: 'Docs',
      category: 'B/L & Manifests',
      badgeColor: '#8B5CF6',
      icon: FileText,
      summary: 'Review Master & House B/Ls, clear holds & export manifests'
    },
    'USR-004': {
      title: 'Destination Agent',
      shortLabel: 'Agent',
      category: 'Port Clearance',
      badgeColor: '#EF4444',
      icon: Shield,
      summary: 'Inspect arrivals, clear customs & coordinate delivery'
    },
    'USR-001': {
      title: 'Administrator',
      shortLabel: 'Admin',
      category: 'Full Access',
      badgeColor: '#0284C7',
      icon: ShieldCheck,
      summary: 'Manage users, permissions & system settings'
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      backgroundColor: '#0A192F',
      backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(2, 132, 199, 0.15), transparent 25%), radial-gradient(circle at 85% 30%, rgba(217, 119, 6, 0.12), transparent 25%), linear-gradient(180deg, #061121 0%, #0A192F 50%, #0F172A 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: '1.5rem 0.75rem',
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      {/* Top Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'inline-block', transform: 'scale(1.05)', marginBottom: '0.5rem' }}>
          <BrandLogo variant="light" size="default" />
        </div>
        <p style={{ color: '#94A3B8', fontSize: '0.825rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.4 }}>
          Freight Forwarding, Cargo Consolidation &amp; Logistics Management System
        </p>
      </div>

      {/* Main Dual Box Container */}
      <div className="login-card-container">

        {/* LEFT COLUMN: Standard Form Sign-in */}
        <div className="login-form-pane">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284C7', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Lock size={14} /> Portal Sign In
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0A192F', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
              Sign In to Your Workspace
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.85rem' }}>
              Select a role icon below or enter your credentials:
            </p>

            {/* Quick 1-Tap Icon Logo Buttons */}
            <div style={{ marginBottom: '1.15rem', background: '#F8FAFC', padding: '0.65rem 0.5rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D97706', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.2rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={13} /> Quick Select Role:
                </span>
                <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>
                  Password: password123
                </span>
              </div>

              {/* 5-Column Clean Icon Buttons in Single Row */}
              <div className="role-icon-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.3rem' }}>
                {sortedUsers.map((u) => {
                  const isSelected = selectedUser.id === u.id;
                  const details = roleDetails[u.id] || {
                    badgeColor: '#059669',
                    icon: Ship,
                    shortLabel: 'Ops'
                  };
                  const Icon = details.icon;

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      className={`role-icon-btn ${isSelected ? 'active' : ''}`}
                      title={`Sign in as ${u.name} (${details.title})`}
                      style={{ padding: '0.45rem 0.15rem' }}
                    >
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: details.badgeColor,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <Icon size={15} />
                      </div>
                      <span className="role-icon-label" style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: isSelected ? '#FFFFFF' : '#334155',
                        textAlign: 'center',
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}>
                        {details.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon-left" style={{ color: '#94A3B8' }} />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@vicustoms.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem', height: '42px', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Password</label>
                  <span style={{ fontSize: '0.75rem', color: '#0284C7', cursor: 'pointer', fontWeight: 600 }}>Default: password123</span>
                </div>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon-left" style={{ color: '#94A3B8' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem', height: '42px', fontSize: '0.875rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94A3B8'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#0A192F', cursor: 'pointer' }}
                  />
                  <span>Remember my login</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{
                  height: '44px',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  marginTop: '0.35rem',
                  backgroundColor: '#0A192F',
                  borderColor: '#0A192F'
                }}
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', fontSize: '0.75rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
            <span>VI Logistics System</span>
            <span>CFS &amp; Maritime Hub</span>
          </div>
        </div>

        {/* RIGHT COLUMN: 1-Click Role Login Hub (Demo Switcher) */}
        <div className="login-roles-pane">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284C7', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Users size={14} /> Workspaces by Role
              </div>
              <span style={{ fontSize: '0.72rem', background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Role-Focused Menus
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A192F', marginBottom: '0.35rem' }}>
              Select a Role to Sign In
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>
              Choose a role below to access their specific workspace and primary actions:
            </p>

            {/* 5 Persona Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {sortedUsers.map((u) => {
                const details = roleDetails[u.id] || {
                  title: u.role,
                  category: u.department,
                  badgeColor: '#0284C7',
                  icon: Users,
                  summary: 'Access operational workspace'
                };
                const Icon = details.icon;
                const isCurrent = selectedUser.id === u.id;

                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectPersona(u)}
                    style={{
                      padding: '0.75rem 0.875rem',
                      borderRadius: '10px',
                      backgroundColor: '#FFFFFF',
                      border: isCurrent ? `2px solid ${details.badgeColor}` : '1px solid #E2E8F0',
                      boxShadow: isCurrent ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.65rem',
                      flexWrap: 'wrap'
                    }}
                    className="card-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '180px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        backgroundColor: details.badgeColor,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        flexShrink: 0
                      }}>
                        <Icon size={17} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, color: '#0A192F', fontSize: '0.88rem' }}>
                            {details.title}
                          </span>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            color: '#475569',
                            background: '#F1F5F9',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            {u.name}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          {details.summary}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLogin(u);
                      }}
                      className="btn btn-sm btn-outline"
                      style={{
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: details.badgeColor,
                        borderColor: details.badgeColor,
                        whiteSpace: 'nowrap',
                        marginLeft: 'auto'
                      }}
                    >
                      <span>Sign In</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '1rem', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0 }} />
            <span>
              <strong>Simplified &amp; Role-Focused:</strong> Irrelevant menus are hidden so each user sees only what they need to do their job.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
