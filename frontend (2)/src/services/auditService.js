import { getStored, setStored, KEYS } from './storageService';
import { apiClient } from './apiClient';

export const auditService = {
  async getLogs(filters = {}) {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.module && filters.module !== 'All') params.module = filters.module;
      params.limit = filters.limit || 200;

      const res = await apiClient.get('audit', { params });

      if (res) {
        const raw = res.data || res;
        const rawLogs = Array.isArray(raw) ? raw : (raw.items || raw.logs || []);
        const formatted = rawLogs.map(l => ({
          ...l,
          id: l.id || l.logNumber,
          logNumber: l.logNumber || l.id,
          user: l.userName || l.user || 'System User',
          userName: l.userName || l.user || 'System User',
          recordId: l.recordId || l.logNumber || 'N/A',
          timestamp: l.timestamp || (l.createdAt ? new Date(l.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : new Date().toLocaleString()),
          ipAddress: l.ipAddress || '127.0.0.1 (Active Session)',
          module: l.module || 'System',
          action: l.action || 'Action',
          description: l.description || ''
        }));
        setStored(KEYS.AUDIT_LOGS, formatted);
        return formatted;
      }
    } catch (e) {
      console.warn('[auditService] Failed to fetch audit logs from API:', e.message);
    }

    const list = getStored(KEYS.AUDIT_LOGS, []);
    return Array.isArray(list) ? list : [];
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

