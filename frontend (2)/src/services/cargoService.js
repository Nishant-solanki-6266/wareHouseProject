import { getStored, setStored, KEYS } from './storageService';
import { auditService } from './auditService';

export const cargoService = {
  async getCargo(filters = {}) {
    const list = getStored(KEYS.CARGO);
    let filtered = [...list];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.id.toLowerCase().includes(q) ||
        item.receiptNumber.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.destinationPort.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    return filtered;
  },

  async getCargoById(id) {
    const list = getStored(KEYS.CARGO);
    return list.find(item => item.id === id) || null;
  },

  async createCargo(data, currentUser = "Warehouse Staff") {
    const list = getStored(KEYS.CARGO);
    const id = data.id || `CRG-${Math.floor(1000 + list.length + 1)}-01`;
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

    const newCargo = {
      ...data,
      id,
      receiptNumber: data.receiptNumber || `WR-2026-${Math.floor(1000 + list.length + 1)}`,
      customer: data.customer || "General Shipper",
      description: data.description || "General Cargo",
      packageCount: pkg,
      packageType: data.packageType || "Cartons",
      lengthInches: l,
      widthInches: w,
      heightInches: h,
      weightLbs: Number(data.weightLbs) || 0,
      cft,
      cbm,
      warehouseLocation: data.warehouseLocation || "Bay A-01",
      destinationPort: data.destinationPort || "NAS - Nassau, Bahamas",
      status: data.status || "Ready for Consolidation",
      barcode: `CRG${Math.floor(10000000 + Math.random() * 90000000)}`,
      qrCode: `VI-CRG-${id}`
    };

    const updated = [newCargo, ...list];
    setStored(KEYS.CARGO, updated);

    await auditService.logAction(
      currentUser,
      "Cargo Inventory",
      "Created Cargo Unit",
      id,
      `Intake cargo ${id} for ${newCargo.customer} (${pkg} ${newCargo.packageType}, ${cbm} CBM).`
    );

    return newCargo;
  },

  async updateCargo(id, updates, currentUser = "Warehouse Staff") {
    const list = getStored(KEYS.CARGO);
    const index = list.findIndex(item => item.id === id);
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
        ...updates,
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
    return null;
  },

  async deleteCargo(id, currentUser = "Warehouse Staff") {
    const list = getStored(KEYS.CARGO);
    const existing = list.find(item => item.id === id);
    if (!existing) return false;

    const filtered = list.filter(item => item.id !== id);
    setStored(KEYS.CARGO, filtered);

    await auditService.logAction(
      currentUser,
      "Cargo Inventory",
      "Deleted Cargo Unit",
      id,
      `Deleted cargo unit ${id} (${existing.customer}).`
    );

    return true;
  }
};

