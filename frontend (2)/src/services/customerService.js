import { getStored, setStored, KEYS } from './storageService';
import { auditService } from './auditService';
import { apiClient } from './apiClient';

export const customerService = {
  async getCustomers(filters = {}) {
    try {
      const apiData = await apiClient.get('/customers');
      if (Array.isArray(apiData) && apiData.length > 0) {
        const mapped = apiData.map(c => ({
          ...c,
          customerNumber: c.customerNumber || c.id,
          telephone: c.telephone || c.phone || '',
        }));
        setStored(KEYS.CUSTOMERS, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Backend customers API notice:', e.message);
    }

    const list = getStored(KEYS.CUSTOMERS);
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
    try {
      const apiData = await apiClient.get(`/customers/${id}`);
      if (apiData) {
        return {
          ...apiData,
          customerNumber: apiData.customerNumber || apiData.id,
          telephone: apiData.telephone || apiData.phone || '',
        };
      }
    } catch (e) {
      // fallback
    }
    const list = getStored(KEYS.CUSTOMERS);
    return list.find(item => item.id === id || item.customerNumber === id || item.name === id) || null;
  },

  async createCustomer(data, currentUser = "Warehouse Staff") {
    try {
      const payload = {
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
      };
      const res = await apiClient.post('/customers', payload);
      if (res && res.data) {
        return {
          ...res.data,
          customerNumber: res.data.customerNumber || res.data.id,
        };
      }
    } catch (e) {
      console.warn('[customerService] API createCustomer failed, using fallback:', e.message);
    }

    const list = getStored(KEYS.CUSTOMERS);
    const nextSeq = list.length + 1;
    const id = `CUS-2026-${String(nextSeq).padStart(4, '0')}`;

    const newCustomer = {
      ...data,
      id,
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

    try {
      const createdApi = await apiClient.post('/customers', newCustomer);
      if (createdApi) Object.assign(newCustomer, createdApi);
    } catch (e) {
      console.warn('Backend customer post notice:', e.message);
    }

    const updated = [newCustomer, ...list];
    setStored(KEYS.CUSTOMERS, updated);

    await auditService.logAction(
      currentUser,
      "Customer",
      "Created Customer Profile",
      id,
      `Created Customer Profile ${id} for ${newCustomer.name} (${newCustomer.destinationPort}).`
    );

    return newCustomer;
  },

  async updateCustomer(id, updates, currentUser = "Warehouse Staff") {
    try {
      await apiClient.patch(`/customers/${id}`, updates);
    } catch (e) {
      console.warn('[customerService] API updateCustomer note:', e.message);
    }

    const list = getStored(KEYS.CUSTOMERS);
    const index = list.findIndex(item => item.id === id || item.customerNumber === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...updates
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
    return null;
  },

  async deleteCustomer(id, currentUser = "Super Admin") {
    try {
      await apiClient.delete(`/customers/${id}`);
    } catch (e) {
      console.warn('[customerService] API deleteCustomer note:', e.message);
    }

    const list = getStored(KEYS.CUSTOMERS);
    const existing = list.find(item => item.id === id || item.customerNumber === id);
    if (!existing) return false;

    const filtered = list.filter(item => item.id !== id && item.customerNumber !== id);
    setStored(KEYS.CUSTOMERS, filtered);

    await auditService.logAction(
      currentUser,
      "Customer",
      "Deleted Customer Profile",
      id,
      `Deleted customer profile ${existing.name} (${id}).`
    );

    return true;
  }
};
