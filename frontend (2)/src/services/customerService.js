import { getStored, setStored, KEYS } from './storageService';
import { auditService } from './auditService';
import { apiFetch } from './apiConfig';

export const customerService = {
  async getCustomers(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.destination && filters.destination !== 'All') queryParams.set('destinationCode', filters.destination);
      if (filters.status && filters.status !== 'All') queryParams.set('status', filters.status);

      const qs = queryParams.toString();
      const endpoint = qs ? `/customers?${qs}&limit=100` : '/customers?limit=100';
      const res = await apiFetch(endpoint);

      if (res && res.data) {
        const liveList = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setStored(KEYS.CUSTOMERS, liveList);
        return liveList;
      }
    } catch (err) {
      console.warn('Backend API /customers fetch failed, using local store:', err.message);
    }

    const list = getStored(KEYS.CUSTOMERS, []);
    let filtered = [...list];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(q) ||
        item.customerNumber?.toLowerCase().includes(q) ||
        item.contactPerson?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.telephone?.toLowerCase().includes(q) ||
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
      const res = await apiFetch(`/customers/${encodeURIComponent(id)}`);
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn(`Backend API fetch for customer ${id} failed:`, err.message);
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
      contactPerson: data.contactPerson || "Primary Contact",
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
      createdDate: data.createdDate || new Date().toISOString().split('T')[0],
      status: data.status || "Active"
    };

    let createdCustomer = null;
    try {
      const res = await apiFetch('/customers', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res && res.data) {
        createdCustomer = res.data;
      }
    } catch (err) {
      console.warn('Backend createCustomer failed, saving locally:', err.message);
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
      "Customer",
      "Created Customer Profile",
      createdCustomer.customerNumber || createdCustomer.id,
      `Created Customer Profile ${createdCustomer.customerNumber || createdCustomer.id} for ${createdCustomer.name} (${createdCustomer.destinationPort}).`
    );

    return createdCustomer;
  },

  async updateCustomer(id, updates, currentUser = "Warehouse Staff") {
    let updatedCustomer = null;
    try {
      const res = await apiFetch(`/customers/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (res && res.data) {
        updatedCustomer = res.data;
      }
    } catch (err) {
      console.warn(`Backend updateCustomer ${id} failed:`, err.message);
    }

    const list = getStored(KEYS.CUSTOMERS, []);
    const index = list.findIndex(item => item.id === id || item.customerNumber === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...(updatedCustomer || updates)
      };
      setStored(KEYS.CUSTOMERS, list);

      await auditService.logAction(
        currentUser,
        "Customer",
        "Updated Customer Profile",
        id,
        `Updated customer profile for ${list[index].name} (${id}).`
      );

      return list[index];
    }
    return updatedCustomer;
  },

  async deleteCustomer(id, currentUser = "Super Admin") {
    try {
      await apiFetch(`/customers/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn(`Backend deleteCustomer ${id} failed:`, err.message);
    }

    const list = getStored(KEYS.CUSTOMERS, []);
    const existing = list.find(item => item.id === id || item.customerNumber === id);
    const filtered = list.filter(item => item.id !== id && item.customerNumber !== id);
    setStored(KEYS.CUSTOMERS, filtered);

    await auditService.logAction(
      currentUser,
      "Customer",
      "Deleted Customer Profile",
      id,
      `Deleted customer profile ${existing?.name || 'Customer'} (${id}).`
    );

    return true;
  }
};
