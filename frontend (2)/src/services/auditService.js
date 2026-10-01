import { getStored, setStored, KEYS } from './storageService';

export const auditService = {
  async getLogs(filters = {}) {
    const list = getStored(KEYS.AUDIT_LOGS);
    let filtered = [...list];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.user.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.recordId.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    if (filters.module && filters.module !== 'All') {
      filtered = filtered.filter(item => item.module === filters.module);
    }
    if (filters.action && filters.action !== 'All') {
      filtered = filtered.filter(item => item.action === filters.action);
    }

    return filtered;
  },

  async logAction(user, module, action, recordId, description) {
    const list = getStored(KEYS.AUDIT_LOGS);
    const newLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      user: typeof user === 'string' ? user : user?.name || "System User",
      module,
      action,
      recordId: recordId || "N/A",
      description,
      ipAddress: "10.0.4.12 (Active Session)"
    };
    const updated = [newLog, ...list];
    setStored(KEYS.AUDIT_LOGS, updated);
    return newLog;
  }
};
