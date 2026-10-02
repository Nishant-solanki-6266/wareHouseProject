import { getStored, setStored, KEYS } from './storageService';
import { auditService } from './auditService';
import { apiFetch } from './apiConfig';

export const billOfLadingService = {
  async getBillsOfLading(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.status && filters.status !== 'All') queryParams.set('status', filters.status);
      if (filters.agentId && filters.agentId !== 'All') queryParams.set('agentId', filters.agentId);

      const qs = queryParams.toString();
      const endpoint = qs ? `/bills-of-lading?${qs}&limit=100` : '/bills-of-lading?limit=100';
      const res = await apiFetch(endpoint);

      if (res && res.data) {
        const liveList = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setStored(KEYS.BILLS_OF_LADING, liveList);
        return liveList;
      }
    } catch (err) {
      console.warn('Backend API /bills-of-lading fetch failed, using cached store:', err.message);
    }

    const list = getStored(KEYS.BILLS_OF_LADING, []);
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
    if (!id) return null;
    try {
      const res = await apiFetch(`/bills-of-lading/${encodeURIComponent(id)}`);
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn(`Backend API fetch for B/L ${id} failed:`, err.message);
    }

    const list = getStored(KEYS.BILLS_OF_LADING, []);
    return list.find(item => item.id === id || item.blNumber === id) || null;
  },

  async createBillOfLading(data, currentUser = "Documentation Staff") {
    let createdBL = null;
    try {
      const res = await apiFetch('/bills-of-lading', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res && res.data) {
        createdBL = res.data;
      }
    } catch (err) {
      console.warn('Backend createBillOfLading failed, storing locally:', err.message);
    }

    if (!createdBL) {
      const list = getStored(KEYS.BILLS_OF_LADING, []);
      const id = data.blNumber || `BL-VI-2026-${96 + list.length}`;
      createdBL = {
        ...data,
        id,
        blNumber: id,
        type: "Master Ocean Bill of Lading",
        createdDate: data.issueDate || new Date().toISOString().split('T')[0],
        status: data.status || "Draft",
        holdDetails: { isOnHold: false },
        charges: [
          { description: "Ocean Freight (Port to Port)", rate: "LCL Consolidated CBM", amount: Number(((data.cbm || 1) * 145).toFixed(2)), prepaid: true },
          { description: "Terminal Handling Charges (THC)", rate: "Flat Container Surcharge", amount: 280.00, prepaid: true },
          { description: "Documentation & Electronic Customs Filing", rate: "Flat Filing Fee", amount: 75.00, prepaid: true }
        ],
        totalFreightUsd: Number((((data.cbm || 1) * 145) + 355).toFixed(2))
      };
    }

    const list = getStored(KEYS.BILLS_OF_LADING, []);
    const updated = [createdBL, ...list.filter(b => b.id !== createdBL.id && b.blNumber !== createdBL.blNumber)];
    setStored(KEYS.BILLS_OF_LADING, updated);

    await auditService.logAction(
      currentUser,
      "Bill of Lading",
      "Created Master B/L",
      createdBL.blNumber || createdBL.id,
      `Issued Master Bill of Lading ${createdBL.blNumber} for ${createdBL.consignee?.name || 'Consignee'} (${createdBL.portOfLoading} → ${createdBL.portOfDischarge}).`
    );

    return createdBL;
  },

  async updateBillOfLading(id, updates, currentUser = "Documentation Staff") {
    let updatedBL = null;
    try {
      const res = await apiFetch(`/bills-of-lading/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (res && res.data) {
        updatedBL = res.data;
      }
    } catch (err) {
      console.warn(`Backend updateBillOfLading ${id} failed:`, err.message);
    }

    const list = getStored(KEYS.BILLS_OF_LADING, []);
    const index = list.findIndex(item => item.id === id || item.blNumber === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...(updatedBL || updates) };
      setStored(KEYS.BILLS_OF_LADING, list);
      updatedBL = list[index];
    }

    await auditService.logAction(
      currentUser,
      "Bill of Lading",
      "Updated Master B/L",
      id,
      `Updated details for Master Bill of Lading ${id}.`
    );

    return updatedBL;
  },

  async deleteBillOfLading(id, currentUser = "Documentation Staff") {
    try {
      await apiFetch(`/bills-of-lading/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn(`Backend deleteBillOfLading ${id} failed:`, err.message);
    }

    const list = getStored(KEYS.BILLS_OF_LADING, []);
    const existing = list.find(item => item.id === id || item.blNumber === id);
    const filtered = list.filter(item => item.id !== id && item.blNumber !== id);
    setStored(KEYS.BILLS_OF_LADING, filtered);

    if (existing) {
      await auditService.logAction(
        currentUser,
        "Bill of Lading",
        "Deleted Master B/L",
        id,
        `Deleted Master Bill of Lading ${id} (${existing.blNumber}).`
      );
    }

    return true;
  },

  async placeHold(blId, reason, notes, currentUser = "Documentation Staff") {
    try {
      await apiFetch(`/bills-of-lading/${encodeURIComponent(blId)}/hold`, {
        method: 'POST',
        body: JSON.stringify({ reason, holdNotes: notes })
      });
    } catch (err) {
      console.warn(`Backend placeHold ${blId} notice:`, err.message);
    }

    const list = getStored(KEYS.BILLS_OF_LADING, []);
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

    if (currentBL.shipmentId) {
      const shipments = getStored(KEYS.SHIPMENTS, []);
      const sIndex = shipments.findIndex(s => s.id === currentBL.shipmentId || s.billOfLadingId === blId);
      if (sIndex !== -1) {
        shipments[sIndex].blStatus = "On Hold";
        setStored(KEYS.SHIPMENTS, shipments);
      }
    }

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
      await apiFetch(`/bills-of-lading/${encodeURIComponent(blId)}/release`, {
        method: 'POST'
      });
    } catch (err) {
      console.warn(`Backend clearHold ${blId} notice:`, err.message);
    }

    const list = getStored(KEYS.BILLS_OF_LADING, []);
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

    if (currentBL.shipmentId) {
      const shipments = getStored(KEYS.SHIPMENTS, []);
      const sIndex = shipments.findIndex(s => s.id === currentBL.shipmentId || s.billOfLadingId === blId);
      if (sIndex !== -1) {
        shipments[sIndex].blStatus = "Released";
        setStored(KEYS.SHIPMENTS, shipments);
      }
    }

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
    const list = getStored(KEYS.BILLS_OF_LADING, []);
    const index = list.findIndex(item => item.id === blId || item.blNumber === blId);
    if (index === -1) return null;

    list[index].status = newStatus;
    setStored(KEYS.BILLS_OF_LADING, list);

    if (list[index].shipmentId) {
      const shipments = getStored(KEYS.SHIPMENTS, []);
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
  }
};
