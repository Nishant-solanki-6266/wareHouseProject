import { getStored, setStored, KEYS } from './storageService';
import { apiClient } from './apiClient';

export const settingsService = {
  async getSettings() {
    try {
      const res = await apiClient.get('settings');
      if (res && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
        const backendSettings = res.data;
        const currentLocal = getStored(KEYS.SETTINGS, {});
        const merged = { ...currentLocal, ...backendSettings };
        setStored(KEYS.SETTINGS, merged);
        return merged;
      }
    } catch (e) {
      console.warn('[settingsService] Could not fetch settings from API, using local storage:', e.message);
    }
    return getStored(KEYS.SETTINGS, {});
  },

  async getSettingByKey(key) {
    try {
      const res = await apiClient.get(`settings/${key}`);
      if (res && res.data) {
        return res.data;
      }
    } catch (e) {
      console.warn(`[settingsService] Could not fetch setting ${key} from API:`, e.message);
    }
    const current = getStored(KEYS.SETTINGS, {});
    return current[key] || null;
  },

  async updateSetting(key, value, description = '') {
    // 1. Update local storage immediately for responsive UI
    const current = getStored(KEYS.SETTINGS, {});
    const updated = { ...current, [key]: value };
    setStored(KEYS.SETTINGS, updated);

    // 2. Persist to PostgreSQL database via Fastify PUT /settings/:key
    try {
      const res = await apiClient.put(`settings/${key}`, { value, description });
      if (res && res.data) {
        return res.data;
      }
    } catch (e) {
      console.warn(`[settingsService] Failed to persist setting ${key} to DB:`, e.message);
    }

    return updated;
  },

  async updateAllSettings(newSettings) {
    const current = getStored(KEYS.SETTINGS, {});
    const merged = { ...current, ...newSettings };
    setStored(KEYS.SETTINGS, merged);

    // Persist each major key to backend database
    const keysToSync = ['numberingRules', 'companyProfile', 'labelSettings', 'unitsAndCurrencies'];
    const promises = keysToSync.map(key => {
      if (newSettings[key]) {
        return apiClient.put(`settings/${key}`, { value: newSettings[key] }).catch(() => null);
      }
      return Promise.resolve(null);
    });

    await Promise.allSettled(promises);
    return merged;
  }
};
