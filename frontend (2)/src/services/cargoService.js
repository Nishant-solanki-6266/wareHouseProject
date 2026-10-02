import { getStored, setStored, KEYS } from './storageService';
import { auditService } from './auditService';
import { apiFetch } from './apiConfig';

export const cargoService = {
  async getCargo(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.status && filters.status !== 'All') queryParams.set('status', filters.status);
      if (filters.destination && filters.destination !== 'All') queryParams.set('destinationCode', filters.destination);
      if (filters.destinationCode && filters.destinationCode !== 'All') queryParams.set('destinationCode', filters.destinationCode);

      const qs = queryParams.toString();
      const endpoint = qs ? `/cargo?${qs}&limit=100` : '/cargo?limit=100';
      const res = await apiFetch(endpoint);

      if (res && res.data) {
        const liveList = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setStored(KEYS.CARGO, liveList);
        return liveList;
      }
    } catch (err) {
      console.warn('Backend API /cargo fetch failed, using local store:', err.message);
    }

    const list = getStored(KEYS.CARGO, []);
    let filtered = [...list];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.id?.toLowerCase().includes(q) ||
        item.cargoNumber?.toLowerCase().includes(q) ||
        item.receiptNumber?.toLowerCase().includes(q) ||
        item.customer?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.destinationPort?.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    return filtered;
  },

  async getCargoById(id) {
    if (!id) return null;
    try {
      const res = await apiFetch(`/cargo/${encodeURIComponent(id)}`);
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn(`Backend API fetch for cargo ${id} failed:`, err.message);
    }

    const list = getStored(KEYS.CARGO, []);
    return list.find(item => item.id === id || item.cargoNumber === id) || null;
  },

  async createCargo(data, currentUser = "Warehouse Staff") {
    const list = getStored(KEYS.CARGO, []);
    const cargoNumber = data.cargoNumber || data.id || `CRG-${Math.floor(1000 + list.length + 1)}-01`;
    const pkg = Number(data.packageCount) || 1;
    const l = Number(data.lengthInches) || 0;
    const w = Number(data.widthInches) || 0;
    const h = Number(data.heightInches) || 0;

    let cft = Number(data.cft) || 0;
    let cbm = Number(data.cbm) || 0;
    if (l && w && h && (!cft || !cbm)) {
      cft = Number(((l * w * h * pkg) / 1728).toFixed(2));
      cbm = Number((cft * 0.0283168).toFixed(2));
    }

    const payload = {
      ...data,
      cargoNumber,
      receiptNumber: data.receiptNumber || `WR-2026-${Math.floor(1000 + list.length + 1)}`,
      customer: data.customer || "General Shipper",
      description: data.description || "General Cargo",
      packageCount: pkg,
      totalPieces: Number(data.totalPieces) || pkg,
      packageType: data.packageType || "Cartons",
      lengthInches: l,
      widthInches: w,
      heightInches: h,
      weightLbs: Number(data.weightLbs) || 0,
      cft,
      cbm,
      warehouseLocation: data.warehouseLocation || "Bay A-01",
      destinationPort: data.destinationPort || "NAS - Nassau, Bahamas",
      destinationCode: data.destinationCode || (data.destinationPort?.includes(' - ') ? data.destinationPort.split(' - ')[0].trim() : 'NAS'),
      status: data.status || "Ready for Consolidation",
      barcode: data.barcode || `CRG${Math.floor(10000000 + Math.random() * 90000000)}`,
      qrCode: data.qrCode || `VI-CRG-${cargoNumber}`
    };

    let createdCargo = null;
    try {
      const res = await apiFetch('/cargo', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res && res.data) {
        createdCargo = res.data;
      }
    } catch (err) {
      console.warn('Backend createCargo failed, saving locally:', err.message);
    }

    if (!createdCargo) {
      createdCargo = {
        ...payload,
        id: cargoNumber
      };
    }

    const updated = [createdCargo, ...list.filter(c => c.id !== createdCargo.id && c.cargoNumber !== createdCargo.cargoNumber)];
    setStored(KEYS.CARGO, updated);

    await auditService.logAction(
      currentUser,
      "Cargo Inventory",
      "Created Cargo Unit",
      createdCargo.cargoNumber || createdCargo.id,
      `Intake cargo ${createdCargo.cargoNumber || createdCargo.id} for ${createdCargo.customer} (${pkg} ${createdCargo.packageType}, ${cbm} CBM).`
    );

    return createdCargo;
  },

  async updateCargo(id, updates, currentUser = "Warehouse Staff") {
    let updatedCargo = null;
    try {
      const res = await apiFetch(`/cargo/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (res && res.data) {
        updatedCargo = res.data;
      }
    } catch (err) {
      console.warn(`Backend updateCargo ${id} failed:`, err.message);
    }

    const list = getStored(KEYS.CARGO, []);
    const index = list.findIndex(item => item.id === id || item.cargoNumber === id);
    if (index !== -1) {
      const pkg = Number(updates.packageCount) || list[index].packageCount || 1;
      const l = Number(updates.lengthInches) || list[index].lengthInches || 0;
      const w = Number(updates.widthInches) || list[index].widthInches || 0;
      const h = Number(updates.heightInches) || list[index].heightInches || 0;

      let cft = Number(updates.cft) || list[index].cft;
      let cbm = Number(updates.cbm) || list[index].cbm;
      if (l && w && h && (updates.lengthInches || updates.widthInches || updates.heightInches || updates.packageCount)) {
        cft = Number(((l * w * h * pkg) / 1728).toFixed(2));
        cbm = Number((cft * 0.0283168).toFixed(2));
      }

      list[index] = {
        ...list[index],
        ...(updatedCargo || updates),
        packageCount: pkg,
        lengthInches: l,
        widthInches: w,
        heightInches: h,
        cft,
        cbm
      };
      setStored(KEYS.CARGO, list);

      await auditService.logAction(
        currentUser,
        "Cargo Inventory",
        "Updated Cargo Unit",
        id,
        `Updated cargo details for ${id}.`
      );

      return list[index];
    }
    return updatedCargo;
  },

  async deleteCargo(id, currentUser = "Warehouse Staff") {
    try {
      await apiFetch(`/cargo/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn(`Backend deleteCargo ${id} failed:`, err.message);
    }

    const list = getStored(KEYS.CARGO, []);
    const existing = list.find(item => item.id === id || item.cargoNumber === id);
    const filtered = list.filter(item => item.id !== id && item.cargoNumber !== id);
    setStored(KEYS.CARGO, filtered);

    await auditService.logAction(
      currentUser,
      "Cargo Inventory",
      "Deleted Cargo Unit",
      id,
      `Deleted cargo unit ${id} (${existing?.customer || 'Cargo'}).`
    );

    return true;
  }
};


