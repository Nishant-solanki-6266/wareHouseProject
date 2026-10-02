import { apiClient } from './apiClient';

export const adminService = {
  async getDashboardMetrics() {
    try {
      const res = await apiClient.get('admin/dashboard');
      if (res && res.data) {
        return res.data;
      }
    } catch (e) {
      console.warn('[adminService] Failed to fetch live dashboard metrics from API:', e.message);
    }
    return null;
  }
};
