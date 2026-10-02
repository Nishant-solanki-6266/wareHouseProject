import { getStored, setStored, KEYS } from './storageService';
import { auditService } from './auditService';
import { apiClient } from './apiClient';
import { apiFetch } from './apiConfig';

export const customerService = {
  async getCustomers(filters = {}) {
    try {
      const res = await apiClient.get('customers', { params: { ...filters, limit: 100 } });
      const apiData = res?.data ? (Array.isArray(res.data) ? res.data : (res.data.items || [])) : (Array.isArray(res) ? res : []);
      if (apiData.length > 0) {
        const mapped = apiData.map(c => ({
          ...c,
          customerNumber: c.customerNumber || c.id,
          telephone: c.telephone || c.phone || '',
        }));
        setStored(KEYS.CUSTOMERS, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Backend customers API notice, using local store:', err?.message || err);
    }

    const list = getStored(KEYS.CUSTOMERS, []);
    let filtered = [...list];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.customerNumber?.toLowerCase().includes(q) ||
        item.name?.toLowerCase().includes(q) ||
        item.contactPerson?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.telephone?.includes(q) ||
        item.phone?.includes(q) ||
        item.destinationPort?.toLowerCase().includes(q)
      );
    }
    if (filters.destination && filters.destination !== 'All') {
      filtered = filtered.filter(item => item.destinationCode === filters.destination);
    }
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    return filtered;
  },

  async getCustomerById(id) {
    if (!id) return null;
    try {
      const res = await apiClient.get(`customers/${encodeURIComponent(id)}`);
      const apiData = res?.data || res;
      if (apiData && apiData.id) {
        return {
          ...apiData,
          customerNumber: apiData.customerNumber || apiData.id,
          telephone: apiData.telephone || apiData.phone || '',
        };
      }
    } catch (err) {
      console.warn(`Backend API fetch for customer ${id} failed:`, err?.message || err);
    }

    const list = getStored(KEYS.CUSTOMERS, []);
    return list.find(item => item.id === id || item.customerNumber === id || item.name === id) || null;
  },

  async createCustomer(data, currentUser = "Warehouse Staff") {
    const list = getStored(KEYS.CUSTOMERS, []);
    const nextSeq = list.length + 1;
    const id = data.customerNumber || `CUS-2026-${String(nextSeq).padStart(4, '0')}`;

    const payload = {
      ...data,
      customerNumber: id,
      name: data.name || data.companyName || "New Customer",
      companyName: data.companyName || data.name || "New Customer",
      contactPerson: data.contactPerson || "",
      email: data.email || "",
      telephone: data.telephone || data.phone || "",
      phone: data.telephone || data.phone || "",
      address: data.address || "",
      destinationPort: data.destinationPort || "NAS - Nassau, Bahamas",
      destinationCode: data.destinationCode || (data.destinationPort ? data.destinationPort.split(' - ')[0] : "NAS"),
      taxId: data.taxId || "",
      accountType: data.accountType || "Commercial Importer",
      creditTerms: data.creditTerms || "Net 30",
      notes: data.notes || "",
      status: data.status || "Active"
    };

    let createdCustomer = null;
    try {
      const res = await apiClient.post('customers', payload);
      if (res && res.data) {
        createdCustomer = {
          ...res.data,
          customerNumber: res.data.customerNumber || res.data.id || id,
        };
      }
    } catch (err) {
      console.warn('Backend createCustomer failed, saving locally:', err?.message || err);
    }

    if (!createdCustomer) {
      createdCustomer = {
        ...payload,
        id
      };
    }

    const updated = [createdCustomer, ...list.filter(c => c.id !== createdCustomer.id && c.customerNumber !== createdCustomer.customerNumber)];
    setStored(KEYS.CUSTOMERS, updated);

    await auditService.logAction(
      currentUser,
      "Customer Directory",
      "Created Customer",
      createdCustomer.customerNumber || createdCustomer.id,
      `Registered client ${createdCustomer.name} (${createdCustomer.customerNumber}, ${createdCustomer.destinationPort}).`
    );

    return createdCustomer;
  },

  async updateCustomer(id, updates, currentUser = "Warehouse Staff") {
    let updatedCustomer = null;
    try {
      const res = await apiClient.put(`customers/${encodeURIComponent(id)}`, updates);
      if (res && res.data) {
        updatedCustomer = res.data;
      }
    } catch (err) {
      console.warn(`Backend updateCustomer ${id} failed:`, err?.message || err);
    }

    const list = getStored(KEYS.CUSTOMERS, []);
    const index = list.findIndex(item => item.id === id || item.customerNumber === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...(updatedCustomer || updates),
        telephone: updates.telephone || updates.phone || list[index].telephone,
        phone: updates.telephone || updates.phone || list[index].phone
      };
      setStored(KEYS.CUSTOMERS, list);

      await auditService.logAction(
        currentUser,
        "Customer Directory",
        "Updated Customer",
        id,
        `Updated master records for customer ${list[index].name} (${list[index].customerNumber}).`
      );

      return list[index];
    }
    return updatedCustomer;
  },

  async deleteCustomer(id, currentUser = "Super Admin") {
    try {
      await apiClient.delete(`customers/${encodeURIComponent(id)}`);
    } catch (err) {
      console.warn(`Backend deleteCustomer ${id} failed:`, err?.message || err);
    }

    const list = getStored(KEYS.CUSTOMERS, []);
    const existing = list.find(item => item.id === id || item.customerNumber === id);
    const filtered = list.filter(item => item.id !== id && item.customerNumber !== id);
    setStored(KEYS.CUSTOMERS, filtered);

    if (existing) {
      await auditService.logAction(
        currentUser,
        "Customer Directory",
        "Deleted Customer",
        id,
        `Removed customer account ${existing.name} (${existing.customerNumber}).`
      );
    }

    return true;
  }
};
