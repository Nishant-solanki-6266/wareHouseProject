import { getStored, setStored, KEYS } from './storageService';
import { auditService } from './auditService';
import { apiClient } from './apiClient';

export const billOfLadingService = {
  async getBillsOfLading(filters = {}) {
    try {
      const res = await apiClient.get('bills-of-lading', filters);
      if (res && Array.isArray(res.data)) {
        setStored(KEYS.BILLS_OF_LADING, res.data);
        return res.data;
      }
    } catch (err) {
      console.warn('API error fetching bills of lading, fallback to local:', err);
    }

    const list = getStored(KEYS.BILLS_OF_LADING);
    let filtered = [...list];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.blNumber?.toLowerCase().includes(q) ||
        item.consignee?.name?.toLowerCase().includes(q) ||
        item.shipper?.name?.toLowerCase().includes(q) ||
        item.oceanVessel?.toLowerCase().includes(q) ||
        item.containerNumber?.toLowerCase().includes(q) ||
        item.agentName?.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    if (filters.agentId && filters.agentId !== 'All') {
      filtered = filtered.filter(item => item.agentId === filters.agentId);
    }

    return filtered;
  },

  async getBillOfLadingById(id) {
    try {
      const res = await apiClient.get(`bills-of-lading/${id}`);
      if (res && res.data) return res.data;
    } catch (err) {
      console.warn('API error fetching bill of lading by id:', err);
    }

    const list = getStored(KEYS.BILLS_OF_LADING);
    return list.find(item => item.id === id || item.blNumber === id) || null;
  },

  async placeHold(blId, reason, notes, currentUser = "Documentation Staff") {
    try {
      await apiClient.post(`bills-of-lading/${blId}/hold`, { reason, holdNotes: notes });
    } catch (err) {
      console.warn('API error placing bill of lading on hold:', err);
    }

    const list = getStored(KEYS.BILLS_OF_LADING);
    const index = list.findIndex(item => item.id === blId || item.blNumber === blId);
    if (index === -1) return null;

    const currentBL = list[index];
    const updatedBL = {
      ...currentBL,
      status: "On Hold",
      holdDetails: {
        isOnHold: true,
        reason: reason || "Administrative Hold",
        placedBy: typeof currentUser === 'string' ? currentUser : currentUser?.name || "Staff",
        placedAt: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        holdCategory: "Compliance & Financial",
        holdNotes: notes || "Documents and release restricted until clearance.",
        contactEmail: "documentation@vicustoms.com",
        contactPhone: "+1 (305) 555-5377"
      }
    };

    list[index] = updatedBL;
    setStored(KEYS.BILLS_OF_LADING, list);

    // Sync with linked shipment
    if (currentBL.shipmentId) {
      const shipments = getStored(KEYS.SHIPMENTS);
      const sIndex = shipments.findIndex(s => s.id === currentBL.shipmentId || s.billOfLadingId === blId);
      if (sIndex !== -1) {
        shipments[sIndex].blStatus = "On Hold";
        setStored(KEYS.SHIPMENTS, shipments);
      }
    }

    // Audit log
    await auditService.logAction(
      currentUser,
      "Bill of Lading",
      "Placed B/L On Hold",
      blId,
      `Placed Master B/L ${blId} On Hold. Reason: "${reason}". Notes: "${notes || 'None'}"`
    );

    return updatedBL;
  },

  async clearHold(blId, currentUser = "Super Admin", clearNotes = "") {
    try {
      await apiClient.post(`bills-of-lading/${blId}/release`, { clearNotes });
    } catch (err) {
      console.warn('API error clearing bill of lading hold:', err);
    }

    const list = getStored(KEYS.BILLS_OF_LADING);
    const index = list.findIndex(item => item.id === blId || item.blNumber === blId);

    if (index === -1) return null;

    const currentBL = list[index];
    const previousReason = currentBL.holdDetails?.reason || "Hold";

    const updatedBL = {
      ...currentBL,
      status: "Released",
      holdDetails: {
        isOnHold: false,
        reason: null,
        releasedBy: typeof currentUser === 'string' ? currentUser : currentUser?.name || "Authorized Staff",
        releasedAt: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        clearNotes: clearNotes || "Hold cleared upon verification."
      }
    };

    list[index] = updatedBL;
    setStored(KEYS.BILLS_OF_LADING, list);

    // Sync with linked shipment
    if (currentBL.shipmentId) {
      const shipments = getStored(KEYS.SHIPMENTS);
      const sIndex = shipments.findIndex(s => s.id === currentBL.shipmentId || s.billOfLadingId === blId);
      if (sIndex !== -1) {
        shipments[sIndex].blStatus = "Released";
        setStored(KEYS.SHIPMENTS, shipments);
      }
    }

    // Audit log
    await auditService.logAction(
      currentUser,
      "Bill of Lading",
      "Cleared Hold & Released B/L",
      blId,
      `Authorized hold clearance for B/L ${blId}. Previous hold reason was: "${previousReason}". Status set to RELEASED.`
    );

    return updatedBL;
  },

  async updateStatus(blId, newStatus, currentUser = "Documentation Staff") {
    const list = getStored(KEYS.BILLS_OF_LADING);
    const index = list.findIndex(item => item.id === blId || item.blNumber === blId);
    if (index === -1) return null;

    list[index].status = newStatus;
    setStored(KEYS.BILLS_OF_LADING, list);

    if (list[index].shipmentId) {
      const shipments = getStored(KEYS.SHIPMENTS);
      const sIndex = shipments.findIndex(s => s.id === list[index].shipmentId);
      if (sIndex !== -1) {
        shipments[sIndex].blStatus = newStatus;
        setStored(KEYS.SHIPMENTS, shipments);
      }
    }

    await auditService.logAction(
      currentUser,
      "Bill of Lading",
      `Updated B/L Status to ${newStatus}`,
      blId,
      `Master B/L ${blId} status changed to ${newStatus}.`
    );

    return list[index];
  },

  async createBillOfLading(data, currentUser = "Documentation Staff") {
    const list = getStored(KEYS.BILLS_OF_LADING);
    const id = `BL-VI-2026-${96 + list.length}`;
    const newBL = {
      ...data,
      id,
      blNumber: id,
      createdDate: new Date().toISOString().split('T')[0],
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      status: data.status || "Draft",
      holdDetails: {
        isOnHold: false,
        reason: null
      }
    };

    const updated = [newBL, ...list];
    setStored(KEYS.BILLS_OF_LADING, updated);

    await auditService.logAction(
      currentUser,
      "Bill of Lading",
      "Created Master Bill of Lading",
      id,
      `Created Master B/L ${id} for Consignee: ${data.consignee?.name || 'General Cargo'}.`
    );

    return newBL;
  },

  async updateBillOfLading(id, updates, currentUser = "Documentation Staff") {
    const list = getStored(KEYS.BILLS_OF_LADING);
    const index = list.findIndex(item => item.id === id || item.blNumber === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...updates
      };
      setStored(KEYS.BILLS_OF_LADING, list);

      await auditService.logAction(
        currentUser,
        "Bill of Lading",
        "Updated Bill of Lading",
        id,
        `Updated Master B/L ${id}.`
      );

      return list[index];
    }
    return null;
  },

  async deleteBillOfLading(id, currentUser = "Documentation Staff") {
    const list = getStored(KEYS.BILLS_OF_LADING);
    const existing = list.find(item => item.id === id || item.blNumber === id);
    if (!existing) return false;

    const filtered = list.filter(item => item.id !== id && item.blNumber !== id);
    setStored(KEYS.BILLS_OF_LADING, filtered);

    await auditService.logAction(
      currentUser,
      "Bill of Lading",
      "Deleted Bill of Lading",
      id,
      `Deleted Master B/L ${id}.`
    );

    return true;
  }
};
