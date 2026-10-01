import { getStored, setStored, KEYS } from './storageService';
import { auditService } from './auditService';

export const shipmentService = {
  async getShipments(filters = {}) {
    const list = getStored(KEYS.SHIPMENTS);
    let filtered = [...list];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.shipmentNumber.toLowerCase().includes(q) ||
        item.trackingNumber.toLowerCase().includes(q) ||
        item.destinationPort.toLowerCase().includes(q) ||
        item.containerNumber?.toLowerCase().includes(q) ||
        item.vesselName?.toLowerCase().includes(q) ||
        item.agentName?.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    if (filters.agentId && filters.agentId !== 'All') {
      filtered = filtered.filter(item => item.agentId === filters.agentId);
    }
    if (filters.blStatus && filters.blStatus !== 'All') {
      filtered = filtered.filter(item => item.blStatus === filters.blStatus);
    }
    if (filters.destination && filters.destination !== 'All') {
      filtered = filtered.filter(item => item.destinationCode === filters.destination);
    }

    return filtered;
  },

  async getShipmentById(id) {
    const list = getStored(KEYS.SHIPMENTS);
    return list.find(item => item.id === id || item.shipmentNumber === id || item.trackingNumber === id) || null;
  },

  async createShipment(data, currentUser = "Operations Staff") {
    const list = getStored(KEYS.SHIPMENTS);
    const id = `SHP-2026-${292 + list.length}`;
    const newShipment = {
      ...data,
      id,
      shipmentNumber: id,
      trackingNumber: `TRK-VI-${Math.floor(100000 + Math.random() * 900000)}`,
      createdDate: new Date().toISOString().split('T')[0],
      status: data.status || "Cargo Received",
      blStatus: data.blStatus || "Draft",
      trackingCheckpoints: [
        {
          id: `chk-${Date.now()}-1`,
          stage: "Cargo Received",
          status: "Completed",
          date: new Date().toISOString().split('T')[0],
          time: "08:30 AM",
          location: data.origin || "Miami CFS Warehouse",
          notes: "Shipment registered in system."
        },
        {
          id: `chk-${Date.now()}-2`,
          stage: "Consolidated",
          status: "Active",
          date: new Date().toISOString().split('T')[0],
          time: "10:00 AM",
          location: "Consolidation Hub",
          notes: "Cargo staging underway."
        },
        { id: `chk-${Date.now()}-3`, stage: "Loaded & Sealed", status: "Pending", date: data.etd || "2026-09-02", notes: "Container loading pending." },
        { id: `chk-${Date.now()}-4`, stage: "In Transit", status: "Pending", date: data.etd || "2026-09-03", notes: "Vessel transit." },
        { id: `chk-${Date.now()}-5`, stage: "Arrived at Port", status: "Pending", date: data.eta || "2026-09-08", notes: "Port arrival." },
        { id: `chk-${Date.now()}-6`, stage: "Delivered / Released", status: "Pending", date: "2026-09-09", notes: "Final clearance." }
      ]
    };

    const updated = [newShipment, ...list];
    setStored(KEYS.SHIPMENTS, updated);

    await auditService.logAction(
      currentUser,
      "Shipments",
      "Created Shipment",
      id,
      `Created Master Shipment ${id} (${data.origin} → ${data.destinationPort}).`
    );

    return newShipment;
  },

  async updateShipment(id, updates, currentUser = "Operations Staff") {
    const list = getStored(KEYS.SHIPMENTS);
    const index = list.findIndex(item => item.id === id || item.shipmentNumber === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      setStored(KEYS.SHIPMENTS, list);

      await auditService.logAction(
        currentUser,
        "Shipments",
        "Updated Shipment",
        id,
        `Updated shipment details for ${id}.`
      );

      return list[index];
    }
    return null;
  },

  async deleteShipment(id, currentUser = "Operations Staff") {
    const list = getStored(KEYS.SHIPMENTS);
    const existing = list.find(item => item.id === id || item.shipmentNumber === id);
    if (!existing) return false;

    const filtered = list.filter(item => item.id !== id && item.shipmentNumber !== id);
    setStored(KEYS.SHIPMENTS, filtered);

    await auditService.logAction(
      currentUser,
      "Shipments",
      "Deleted Shipment",
      id,
      `Deleted shipment ${id} (${existing.shipmentNumber}).`
    );

    return true;
  }
};
