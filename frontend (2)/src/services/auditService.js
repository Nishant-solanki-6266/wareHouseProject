import { getStored, setStored, KEYS } from './storageService';
import { apiClient } from './apiClient';

export const auditService = {
  async getLogs(filters = {}) {
    try {
      const res = await apiClient.get('audit', {
        search: filters.search || '',
        module: filters.module && filters.module !== 'All' ? filters.module : '',
        limit: 100,
      });

      if (res && res.data) {
        const rawLogs = Array.isArray(res.data) ? res.data : (res.data.items || res.data.logs || []);
        if (rawLogs.length > 0) {
          return rawLogs.map(l => ({
            ...l,
            user: l.userName || l.user || 'System User',
            recordId: l.recordId || l.logNumber || 'N/A',
          }));
        }
      }
    } catch (e) {
      console.warn('[auditService] Failed to fetch audit logs from API, using fallback:', e.message);
    }

    const list = getStored(KEYS.AUDIT_LOGS);
    let filtered = [...list];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.user?.toLowerCase().includes(q) ||
        item.module?.toLowerCase().includes(q) ||
        item.action?.toLowerCase().includes(q) ||
        item.recordId?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
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

  async logAction(user, module, action, recordId, description, metadata = {}) {
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
      ipAddress: "127.0.0.1 (Active Session)"
    };
    const updated = [newLog, ...list];
    setStored(KEYS.AUDIT_LOGS, updated);

    // Persist to backend PostgreSQL database
    try {
      const payload = {
        userName: typeof user === 'string' ? user : user?.name || "System User",
        userRole: user?.roleKey || user?.role || undefined,
        userId: user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id) ? user.id : undefined,
        module,
        action,
        recordId: recordId || "N/A",
        description,
        metadata: metadata || {}
      };
      await apiClient.post('audit', payload);
    } catch (e) {
      console.warn('[auditService] Note: Failed to persist audit log to DB, stored locally:', e.message);
    }

    return newLog;
  }
};

