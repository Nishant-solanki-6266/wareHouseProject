import { getStored, setStored, KEYS } from './storageService';
import { auditService } from './auditService';
import { apiClient } from './apiClient';

export const warehouseService = {
  async getReceipts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status && filters.status !== 'All') queryParams.append('status', filters.status);
      if (filters.destination && filters.destination !== 'All') queryParams.append('destinationCode', filters.destination);
      if (filters.customerId && filters.customerId !== 'All') queryParams.append('customerId', filters.customerId);

      const qs = queryParams.toString();
      const apiData = await apiClient.get(`/warehouse-receipts${qs ? '?' + qs : ''}`);
      if (Array.isArray(apiData) && apiData.length > 0) {
        const localList = getStored(KEYS.WAREHOUSE_RECEIPTS);
        const mergedMap = new Map();
        [...localList, ...apiData].forEach(item => {
          const key = item.id || item.receiptNumber;
          if (key) mergedMap.set(key, { ...mergedMap.get(key), ...item });
        });
        const merged = Array.from(mergedMap.values());
        setStored(KEYS.WAREHOUSE_RECEIPTS, merged);
        return merged;
      }
    } catch (e) {
      console.warn('Backend warehouse-receipts fetch note:', e.message);
    }

    // Local fallback
    const list = getStored(KEYS.WAREHOUSE_RECEIPTS);
    let filtered = [...list];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.receiptNumber?.toLowerCase().includes(q) ||
        item.customer?.toLowerCase().includes(q) ||
        item.customerName?.toLowerCase().includes(q) ||
        item.consignee?.toLowerCase().includes(q) ||
        item.cargoDescription?.toLowerCase().includes(q) ||
        item.destinationPort?.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    if (filters.agentId && filters.agentId !== 'All') {
      filtered = filtered.filter(item => item.agentId === filters.agentId);
    }
    if (filters.destination && filters.destination !== 'All') {
      filtered = filtered.filter(item => item.destinationCode === filters.destination);
    }
    if (filters.customerId && filters.customerId !== 'All') {
      filtered = filtered.filter(item => item.customerId === filters.customerId);
    }

    return filtered;
  },

  async getReceiptById(id) {
    try {
      const apiData = await apiClient.get(`/warehouse-receipts/${id}`);
      if (apiData) return apiData;
    } catch (e) {
      // fallback
    }
    const list = getStored(KEYS.WAREHOUSE_RECEIPTS);
    return list.find(item => item.id === id || item.receiptNumber === id) || null;
  },

  async createReceipt(receiptData, currentUser = "Warehouse Staff") {
    try {
      const payload = {
        date: receiptData.date,
        customerId: receiptData.customerId || undefined,
        customerName: receiptData.customerName || receiptData.customer || "General Cargo",
        shipper: receiptData.shipper || receiptData.customerName || "General Cargo",
        consignee: receiptData.consignee || "Consignee",
        agentId: receiptData.agentId || undefined,
        agentName: receiptData.agentName || undefined,
        destinationPort: receiptData.destinationPort || "NAS - Nassau, Bahamas",
        destinationCode: receiptData.destinationCode || "NAS",
        cargoDescription: receiptData.cargoDescription || "General Cargo",
        packages: receiptData.packages || [],
        warehouseLocation: receiptData.warehouseLocation || "Bay A-01",
        status: receiptData.status || "Ready for Consolidation",
        notes: receiptData.notes || "",
      };
      const res = await apiClient.post('warehouse-receipts', payload);
      if (res && res.data) {
        const list = getStored(KEYS.WAREHOUSE_RECEIPTS);
        setStored(KEYS.WAREHOUSE_RECEIPTS, [res.data, ...list]);
        return res.data;
      }
    } catch (err) {
      console.warn('API error creating warehouse receipt, fallback to local:', err);
    }

    const list = getStored(KEYS.WAREHOUSE_RECEIPTS);
    const nextSeq = 1040 + list.length + 1;
    const id = receiptData.receiptNumber || `WR-2026-${nextSeq}`;

    
    // Process packages array if provided, or build single package default
    let packages = receiptData.packages || [];
    if (packages.length === 0) {
      const l = Number(receiptData.lengthInches) || Number(receiptData.length) || 0;
      const w = Number(receiptData.widthInches) || Number(receiptData.width) || 0;
      const h = Number(receiptData.heightInches) || Number(receiptData.height) || 0;
      const pCount = Number(receiptData.packageCount) || 1;
      const pWeight = Number(receiptData.weightLbs) || 0;
      
      let pCft = 0;
      let pCbm = 0;
      if (l && w && h) {
        pCft = Number(((l * w * h * pCount) / 1728).toFixed(2));
        pCbm = Number((pCft * 0.0283168).toFixed(2));
      }

      packages = [{
        id: `PKG-${id.replace('WR-2026-', '')}-01`,
        packageType: receiptData.packageType || "Carton",
        description: receiptData.cargoDescription || "General Cargo",
        lengthInches: l,
        widthInches: w,
        heightInches: h,
        weightLbs: pWeight,
        pieces: pCount,
        cft: pCft,
        cbm: pCbm
      }];
    }

    // Calculate aggregated totals from packages
    let totalPieces = 0;
    let totalWeightLbs = 0;
    let totalCft = 0;
    let totalCbm = 0;

    packages.forEach(pkg => {
      totalPieces += Number(pkg.pieces || 1);
      totalWeightLbs += Number(pkg.weightLbs || 0);
      totalCft += Number(pkg.cft || 0);
      totalCbm += Number(pkg.cbm || 0);
    });

    totalCft = Number(totalCft.toFixed(2));
    totalCbm = Number(totalCbm.toFixed(2));
    const totalWeightKg = Number((totalWeightLbs * 0.453592).toFixed(1));

    const newReceipt = {
      ...receiptData,
      id,
      receiptNumber: id,
      date: receiptData.date || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerId: receiptData.customerId || null,
      customer: receiptData.customer || receiptData.customerName || "General Cargo",
      customerName: receiptData.customer || receiptData.customerName || "General Cargo",
      destinationPort: receiptData.destinationPort || "NAS - Nassau, Bahamas",
      destinationCode: receiptData.destinationCode || (receiptData.destinationPort ? receiptData.destinationPort.split(' - ')[0] : 'NAS'),
      status: receiptData.status || "Ready for Consolidation",
      packages,
      packageCount: packages.length,
      totalPieces,
      weightLbs: totalWeightLbs,
      weightKg: totalWeightKg,
      cft: totalCft,
      cbm: totalCbm,
      barcode: `WR${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      qrCode: `VI-${id}-${receiptData.destinationCode || 'NAS'}-${totalPieces}PK`,
      assignedHouseBillId: null,
      assignedConsolidationId: null,
      assignedShipmentId: null
    };

    // Try posting to backend API
    try {
      const createdApi = await apiClient.post('/warehouse-receipts', newReceipt);
      if (createdApi) {
        Object.assign(newReceipt, createdApi);
      }
    } catch (e) {
      console.warn('Backend warehouse-receipt post note:', e.message);
    }

    const updated = [newReceipt, ...list];
    setStored(KEYS.WAREHOUSE_RECEIPTS, updated);

    // Also add to cargo inventory
    const cargoList = getStored(KEYS.CARGO);
    const newCargo = {
      id: `CRG-${id.replace('WR-2026-', '')}-01`,
      warehouseReceiptId: id,
      receiptNumber: id,
      customer: newReceipt.customer,
      description: newReceipt.cargoDescription || packages[0]?.description || "General Freight",
      packageCount: newReceipt.packageCount,
      totalPieces,
      packageType: packages[0]?.packageType || "Cartons",
      weightLbs: totalWeightLbs,
      cft: totalCft,
      cbm: totalCbm,
      warehouseLocation: newReceipt.warehouseLocation || "Bay A-01",
      destinationPort: newReceipt.destinationPort,
      destinationCode: newReceipt.destinationCode,
      status: "Ready for Consolidation",
      barcode: `CRG${Math.floor(10000000 + Math.random() * 90000000)}`,
      qrCode: `VI-CRG-${id}`
    };
    setStored(KEYS.CARGO, [newCargo, ...cargoList]);

    // Audit log
    await auditService.logAction(
      currentUser,
      "Warehouse Receipt",
      "Created Warehouse Receipt",
      id,
      `Intake completed for ${newReceipt.customer} (${id}): ${packages.length} package type(s), ${totalPieces} total piece(s), ${totalCbm} CBM.`
    );

    return newReceipt;
  },

  async updateReceipt(id, updates, currentUser = "Warehouse Staff") {
    try {
      await apiClient.patch(`/warehouse-receipts/${id}`, updates);
    } catch (e) {
      console.warn('API error updating receipt:', e.message);
    }

    const list = getStored(KEYS.WAREHOUSE_RECEIPTS);
    const index = list.findIndex(item => item.id === id || item.receiptNumber === id);
    if (index !== -1) {
      let packages = updates.packages || list[index].packages || [];
      
      let totalPieces = 0;
      let totalWeightLbs = 0;
      let totalCft = 0;
      let totalCbm = 0;

      if (packages.length > 0) {
        packages.forEach(pkg => {
          totalPieces += Number(pkg.pieces || 1);
          totalWeightLbs += Number(pkg.weightLbs || 0);
          totalCft += Number(pkg.cft || 0);
          totalCbm += Number(pkg.cbm || 0);
        });
      } else {
        totalPieces = Number(updates.totalPieces || updates.packageCount || list[index].totalPieces || 1);
        totalWeightLbs = Number(updates.weightLbs || list[index].weightLbs || 0);
        totalCft = Number(updates.cft || list[index].cft || 0);
        totalCbm = Number(updates.cbm || list[index].cbm || 0);
      }

      totalCft = Number(totalCft.toFixed(2));
      totalCbm = Number(totalCbm.toFixed(2));
      const totalWeightKg = Number((totalWeightLbs * 0.453592).toFixed(1));

      list[index] = {
        ...list[index],
        ...updates,
        packages,
        packageCount: packages.length || list[index].packageCount,
        totalPieces,
        weightLbs: totalWeightLbs,
        weightKg: totalWeightKg,
        cft: totalCft,
        cbm: totalCbm
      };
      setStored(KEYS.WAREHOUSE_RECEIPTS, list);

      // Update linked cargo
      const cargoList = getStored(KEYS.CARGO);
      const cargoIdx = cargoList.findIndex(c => c.warehouseReceiptId === id || c.receiptNumber === id);
      if (cargoIdx !== -1) {
        cargoList[cargoIdx] = {
          ...cargoList[cargoIdx],
          customer: updates.customer || cargoList[cargoIdx].customer,
          description: updates.cargoDescription || cargoList[cargoIdx].description,
          packageCount: packages.length || cargoList[cargoIdx].packageCount,
          totalPieces,
          weightLbs: totalWeightLbs,
          cft: totalCft,
          cbm: totalCbm,
          warehouseLocation: updates.warehouseLocation || cargoList[cargoIdx].warehouseLocation,
          destinationPort: updates.destinationPort || cargoList[cargoIdx].destinationPort,
          status: updates.status || cargoList[cargoIdx].status
        };
        setStored(KEYS.CARGO, cargoList);
      }

      await auditService.logAction(
        currentUser,
        "Warehouse Receipt",
        "Updated Warehouse Receipt",
        id,
        `Updated details for ${id} (${list[index].customer}).`
      );

      return list[index];
    }
    return null;
  },

  async deleteReceipt(id, currentUser = "Warehouse Staff") {
    try {
      await apiClient.delete(`/warehouse-receipts/${id}`);
    } catch (e) {
      console.warn('API error deleting receipt:', e.message);
    }

    const list = getStored(KEYS.WAREHOUSE_RECEIPTS);
    const existing = list.find(item => item.id === id || item.receiptNumber === id);
    if (!existing) return false;

    const filtered = list.filter(item => item.id !== id && item.receiptNumber !== id);
    setStored(KEYS.WAREHOUSE_RECEIPTS, filtered);


    // Also remove from cargo if exists
    const cargoList = getStored(KEYS.CARGO);
    const filteredCargo = cargoList.filter(c => c.warehouseReceiptId !== id && c.receiptNumber !== id);
    setStored(KEYS.CARGO, filteredCargo);

    await auditService.logAction(
      currentUser,
      "Warehouse Receipt",
      "Deleted Warehouse Receipt",
      id,
      `Deleted ${id} for customer ${existing.customer}.`
    );

    return true;
  }
};
