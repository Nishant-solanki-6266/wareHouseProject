import { getStored, setStored, KEYS } from './storageService';
import { auditService } from './auditService';

export const portService = {
  async getPorts(filters = {}) {
    const list = getStored(KEYS.PORTS);
    let filtered = [...list];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.code?.toLowerCase().includes(q) ||
        item.name?.toLowerCase().includes(q) ||
        item.island?.toLowerCase().includes(q) ||
        item.country?.toLowerCase().includes(q)
      );
    }

    return filtered;
  },

  async getPortByCode(code) {
    const list = getStored(KEYS.PORTS);
    return list.find(item => item.code === code || item.id === code) || null;
  },

  async createPort(data, currentUser = "Super Admin") {
    const list = getStored(KEYS.PORTS);
    const code = (data.code || 'PRT').toUpperCase().trim();
    const id = data.id || `PORT-${code}`;

    const newPort = {
      ...data,
      id,
      code,
      name: data.name || `${code} Commercial Port`,
      island: data.island || 'Island',
      country: data.country || 'Bahamas',
      status: data.status || 'Active',
      defaultAgent: data.defaultAgent || 'Local Port Agency'
    };

    const updated = [...list, newPort];
    setStored(KEYS.PORTS, updated);

    await auditService.logAction(
      currentUser,
      "Port Management",
      "Added Island Port Destination",
      code,
      `Registered new port destination ${code} - ${newPort.name} (${newPort.island}, ${newPort.country}).`
    );

    return newPort;
  },

  async updatePort(id, updates, currentUser = "Super Admin") {
    const list = getStored(KEYS.PORTS);
    const index = list.findIndex(item => item.id === id || item.code === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...updates
      };
      setStored(KEYS.PORTS, list);

      await auditService.logAction(
        currentUser,
        "Port Management",
        "Updated Island Port Destination",
        id,
        `Updated port destination details for ${list[index].code} - ${list[index].name}.`
      );

      return list[index];
    }
    return null;
  },

  async deletePort(id, currentUser = "Super Admin") {
    const list = getStored(KEYS.PORTS);
    const existing = list.find(item => item.id === id || item.code === id);
    if (!existing) return false;

    const filtered = list.filter(item => item.id !== id && item.code !== id);
    setStored(KEYS.PORTS, filtered);

    await auditService.logAction(
      currentUser,
      "Port Management",
      "Deleted Island Port Destination",
      id,
      `Deleted port destination ${existing.code} - ${existing.name}.`
    );

    return true;
  }
};
