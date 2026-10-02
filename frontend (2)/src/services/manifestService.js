import { getStored, setStored, KEYS } from './storageService';
import { auditService } from './auditService';
import { apiFetch } from './apiConfig';

export const manifestService = {
  async getManifests(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.status && filters.status !== 'All') queryParams.set('status', filters.status);

      const qs = queryParams.toString();
      const endpoint = qs ? `/manifests?${qs}&limit=100` : '/manifests?limit=100';
      const res = await apiFetch(endpoint);

      if (res && res.data) {
        const liveList = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setStored(KEYS.MANIFESTS, liveList);
        return liveList;
      }
    } catch (err) {
      console.warn('Backend API /manifests fetch failed, using cached store:', err.message);
    }

    const list = getStored(KEYS.MANIFESTS, []);
    let filtered = [...list];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.manifestNumber?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.vesselName?.toLowerCase().includes(q) ||
        item.voyageNumber?.toLowerCase().includes(q) ||
        item.portOfDischarge?.toLowerCase().includes(q)
      );
    }
    return filtered;
  },

  async getManifestById(id) {
    if (!id) return null;
    try {
      const res = await apiFetch(`/manifests/${encodeURIComponent(id)}`);
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn(`Backend API fetch for manifest ${id} failed:`, err.message);
    }

    const list = getStored(KEYS.MANIFESTS, []);
    return list.find(item => item.id === id || item.manifestNumber === id) || null;
  },

  async generateManifest(manifestData, currentUser = "Documentation Staff") {
    let createdManifest = null;
    try {
      const res = await apiFetch('/manifests', {
        method: 'POST',
        body: JSON.stringify(manifestData)
      });
      if (res && res.data) {
        createdManifest = res.data;
      }
    } catch (err) {
      console.warn('Backend generateManifest failed, using local store:', err.message);
    }

    if (!createdManifest) {
      const list = getStored(KEYS.MANIFESTS, []);
      const id = manifestData.manifestNumber || `MNF-2026-${443 + list.length}`;
      createdManifest = {
        ...manifestData,
        id,
        manifestNumber: id,
        type: "Ocean Cargo Inward / Outward Manifest",
        status: manifestData.status || "Generated",
        createdAt: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      };
    }

    const list = getStored(KEYS.MANIFESTS, []);
    const updated = [createdManifest, ...list.filter(m => m.id !== createdManifest.id && m.manifestNumber !== createdManifest.manifestNumber)];
    setStored(KEYS.MANIFESTS, updated);

    await auditService.logAction(
      currentUser,
      "Shipping Manifest",
      "Generated Shipping Manifest",
      createdManifest.manifestNumber || createdManifest.id,
      `Generated Manifest ${createdManifest.manifestNumber || createdManifest.id} for Vessel ${createdManifest.vesselName} (Voyage ${createdManifest.voyageNumber}).`
    );

    return createdManifest;
  },

  async updateManifest(id, updates, currentUser = "Documentation Staff") {
    let updatedManifest = null;
    try {
      const res = await apiFetch(`/manifests/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (res && res.data) {
        updatedManifest = res.data;
      }
    } catch (err) {
      console.warn(`Backend updateManifest ${id} failed:`, err.message);
    }

    const list = getStored(KEYS.MANIFESTS, []);
    const index = list.findIndex(item => item.id === id || item.manifestNumber === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...(updatedManifest || updates)
      };
      setStored(KEYS.MANIFESTS, list);
      updatedManifest = list[index];
    }

    await auditService.logAction(
      currentUser,
      "Shipping Manifest",
      "Updated Shipping Manifest",
      id,
      `Updated Manifest ${id}.`
    );

    return updatedManifest;
  },

  async deleteManifest(id, currentUser = "Documentation Staff") {
    try {
      await apiFetch(`/manifests/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn(`Backend deleteManifest ${id} failed:`, err.message);
    }

    const list = getStored(KEYS.MANIFESTS, []);
    const existing = list.find(item => item.id === id || item.manifestNumber === id);
    const filtered = list.filter(item => item.id !== id && item.manifestNumber !== id);
    setStored(KEYS.MANIFESTS, filtered);

    if (existing) {
      await auditService.logAction(
        currentUser,
        "Shipping Manifest",
        "Deleted Shipping Manifest",
        id,
        `Deleted Manifest ${id}.`
      );
    }

    return true;
  },

  // Generates and downloads real CSV file
  exportCsv(manifest) {
    if (!manifest || !manifest.lineItems) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Item #,House B/L,Master B/L,Shipper,Consignee,Notify Party,Container #,Seal #,Packages,Package Type,Description,Gross Wt (LBS),Gross Wt (KG),CFT (Primary),CBM (Secondary),Customs Value (USD)\r\n";

    manifest.lineItems.forEach(item => {
      const cftVal = item.cft || Number(((item.cbm || 0) * 35.3147).toFixed(2));
      const row = [
        item.itemNumber,
        `"${item.hblNumber || 'DIRECT'}"`,
        `"${item.blNumber}"`,
        `"${(item.shipper || '').replace(/"/g, '""')}"`,
        `"${(item.consignee || '').replace(/"/g, '""')}"`,
        `"${(item.notifyParty || '').replace(/"/g, '""')}"`,
        `"${item.containerNumber}"`,
        `"${item.sealNumber}"`,
        item.packageCount,
        `"${item.packageType}"`,
        `"${(item.cargoDescription || '').replace(/"/g, '""')}"`,
        item.grossWeightLbs,
        item.grossWeightKg,
        cftVal,
        item.cbm,
        item.customsValueUsd || ''
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KERS_Manifest_${manifest.manifestNumber}_${manifest.voyageNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Generates and downloads real standardized Customs XML
  exportXml(manifest) {
    if (!manifest) return;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<OceanCargoManifest xmlns="urn:kers:customs:manifest:v1">\n`;
    xml += `  <Header>\n`;
    xml += `    <ManifestNumber>${manifest.manifestNumber}</ManifestNumber>\n`;
    xml += `    <MessageType>OUTWARD_CARGO_MANIFEST</MessageType>\n`;
    xml += `    <Carrier>${manifest.carrier || 'VI Customs Brokers & Logistics'}</Carrier>\n`;
    xml += `    <VesselName>${manifest.vesselName}</VesselName>\n`;
    xml += `    <VoyageNumber>${manifest.voyageNumber}</VoyageNumber>\n`;
    xml += `    <PortOfLoading>${manifest.portOfLoading}</PortOfLoading>\n`;
    xml += `    <PortOfDischarge>${manifest.portOfDischarge}</PortOfDischarge>\n`;
    xml += `    <DepartureDate>${manifest.departureDate}</DepartureDate>\n`;
    xml += `    <EstimatedArrivalDate>${manifest.arrivalDate}</EstimatedArrivalDate>\n`;
    xml += `    <TotalBillsOfLading>${manifest.totalBLs || 1}</TotalBillsOfLading>\n`;
    xml += `    <TotalPackages>${manifest.totalPackages}</TotalPackages>\n`;
    xml += `    <TotalGrossWeightLbs>${manifest.totalWeightLbs || Number(((manifest.totalWeightKg || 0) * 2.20462).toFixed(1))}</TotalGrossWeightLbs>\n`;
    xml += `    <TotalGrossWeightKg>${manifest.totalWeightKg}</TotalGrossWeightKg>\n`;
    xml += `    <TotalVolumeCFT>${manifest.totalCft || Number(((manifest.totalCbm || 0) * 35.3147).toFixed(2))}</TotalVolumeCFT>\n`;
    xml += `    <TotalVolumeCBM>${manifest.totalCbm}</TotalVolumeCBM>\n`;
    xml += `  </Header>\n`;
    xml += `  <ConsignmentItems>\n`;

    (manifest.lineItems || []).forEach(item => {
      const cftVal = item.cft || Number(((item.cbm || 0) * 35.3147).toFixed(2));
      xml += `    <Item index="${item.itemNumber}">\n`;
      xml += `      <HouseBillNumber>${item.hblNumber || 'DIRECT'}</HouseBillNumber>\n`;
      xml += `      <MasterBillOfLadingNumber>${item.blNumber}</MasterBillOfLadingNumber>\n`;
      xml += `      <Shipper><![CDATA[${item.shipper}]]></Shipper>\n`;
      xml += `      <Consignee><![CDATA[${item.consignee}]]></Consignee>\n`;
      xml += `      <NotifyParty><![CDATA[${item.notifyParty}]]></NotifyParty>\n`;
      xml += `      <ContainerDetails>\n`;
      xml += `        <ContainerNumber>${item.containerNumber}</ContainerNumber>\n`;
      xml += `        <SealNumber>${item.sealNumber}</SealNumber>\n`;
      xml += `      </ContainerDetails>\n`;
      xml += `      <CargoDetails>\n`;
      xml += `        <Packages count="${item.packageCount}" type="${item.packageType}" />\n`;
      xml += `        <Description><![CDATA[${item.cargoDescription}]]></Description>\n`;
      xml += `        <Weight unit="LBS">${item.grossWeightLbs || ''}</Weight>\n`;
      xml += `        <Weight unit="KG">${item.grossWeightKg}</Weight>\n`;
      xml += `        <Volume unit="CFT">${cftVal}</Volume>\n`;
      xml += `        <Volume unit="CBM">${item.cbm}</Volume>\n`;
      xml += `        <DeclaredCustomsValue currency="USD">${item.customsValueUsd || ''}</DeclaredCustomsValue>\n`;
      xml += `      </CargoDetails>\n`;
      xml += `    </Item>\n`;
    });

    xml += `  </ConsignmentItems>\n`;
    xml += `</OceanCargoManifest>`;

    const blob = new Blob([xml], { type: "text/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `KERS_Customs_Manifest_${manifest.manifestNumber}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
