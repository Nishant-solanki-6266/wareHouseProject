import { getStored, setStored, KEYS } from './storageService';
import { auditService } from './auditService';
import { apiClient } from './apiClient';

export const customerService = {
  async getCustomers(filters = {}) {
    try {
      const res = await apiClient.get('customers', {
        search: filters.search || '',
        destinationCode: filters.destination && filters.destination !== 'All' ? filters.destination : '',
        status: filters.status && filters.status !== 'All' ? filters.status : '',
        limit: 100,
      });

      if (res && res.data) {
        const customers = Array.isArray(res.data) ? res.data : (res.data.items || res.data.customers || []);
        const mapped = customers.map(c => ({
          ...c,
          customerNumber: c.customerNumber || c.id,
          telephone: c.telephone || c.phone || '',
        }));
        setStored(KEYS.CUSTOMERS, mapped);
        return mapped;
      }

    } catch (e) {
      console.warn('[customerService] API getCustomers failed, using fallback:', e.message);
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
      const res = await apiClient.get(`customers/${id}`);
      if (res && res.data) {
        return {
          ...res.data,
          customerNumber: res.data.customerNumber || res.data.id,
          telephone: res.data.telephone || res.data.phone || '',
        };
      }
    } catch {
      // fallback
    }
    const list = getStored(KEYS.CUSTOMERS);
    return list.find(item => item.id === id || item.customerNumber === id || item.name === id) || null;
  },

  async createCustomer(data, currentUser = "Warehouse Staff") {
    let createdItem = null;
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
      const res = await apiClient.post('customers', payload);
      if (res && res.data) {
        createdItem = {
          ...res.data,
          customerNumber: res.data.customerNumber || res.data.id,
          telephone: res.data.telephone || res.data.phone || payload.telephone || '',
        };
      }
    } catch (e) {
      console.warn('[customerService] API createCustomer failed, using fallback:', e.message);
    }

    const list = getStored(KEYS.CUSTOMERS);
    if (createdItem) {
      const updated = [createdItem, ...list.filter(item => item.id !== createdItem.id && item.customerNumber !== createdItem.customerNumber)];
      setStored(KEYS.CUSTOMERS, updated);

      await auditService.logAction(
        currentUser,
        "Customer",
        "Created Customer Profile",
        createdItem.id || createdItem.customerNumber,
        `Created Customer Profile ${createdItem.customerNumber} for ${createdItem.name}.`
      );

      return createdItem;
    }

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
    let apiUpdated = null;
    try {
      const payload = {
        name: updates.name || updates.companyName,
        companyName: updates.companyName || updates.name,
        contactPerson: updates.contactPerson,
        email: updates.email,
        telephone: updates.telephone || updates.phone,
        phone: updates.telephone || updates.phone,
        address: updates.address,
        destinationPort: updates.destinationPort,
        destinationCode: updates.destinationCode || (updates.destinationPort ? updates.destinationPort.split(' - ')[0] : undefined),
        taxId: updates.taxId,
        accountType: updates.accountType,
        creditTerms: updates.creditTerms,
        notes: updates.notes,
        status: updates.status,
      };

      // Clean undefined keys
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      const res = await apiClient.patch(`customers/${id}`, payload);
      if (res && res.data) {
        apiUpdated = {
          ...res.data,
          customerNumber: res.data.customerNumber || res.data.id,
          telephone: res.data.telephone || res.data.phone || updates.telephone || '',
        };
      }
    } catch (e) {
      console.warn('[customerService] API updateCustomer failed, using fallback:', e.message);
    }

    const list = getStored(KEYS.CUSTOMERS);
    const index = list.findIndex(item => item.id === id || item.customerNumber === id);
    if (index !== -1) {
      const merged = {
        ...list[index],
        ...updates,
        ...(apiUpdated || {})
      };
      list[index] = merged;
      setStored(KEYS.CUSTOMERS, list);

      await auditService.logAction(
        currentUser,
        "Customer",
        "Updated Customer Profile",
        id,
        `Updated customer profile for ${merged.name} (${id}).`
      );

      return merged;
    } else if (apiUpdated) {
      list.unshift(apiUpdated);
      setStored(KEYS.CUSTOMERS, list);
      return apiUpdated;
    }
    return null;
  },

  async deleteCustomer(id, currentUser = "Super Admin") {
    try {
      await apiClient.delete(`customers/${id}`);
    } catch (e) {
      console.warn('[customerService] API deleteCustomer failed, using fallback:', e.message);
    }

    const list = getStored(KEYS.CUSTOMERS);
    const existing = list.find(item => item.id === id || item.customerNumber === id);
    const filtered = list.filter(item => item.id !== id && item.customerNumber !== id);
    setStored(KEYS.CUSTOMERS, filtered);

    await auditService.logAction(
      currentUser,
      "Customer",
      "Deleted Customer Profile",
      id,
      `Deleted customer profile ${existing?.name || id} (${id}).`
    );

    return true;
  }
};
