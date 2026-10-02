import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStored, setStored, KEYS, initializeStorage, clearTransactionalData } from '../services/storageService';
import { customerService } from '../services/customerService';
import { warehouseService } from '../services/warehouseService';
import { cargoService } from '../services/cargoService';
import { houseBillService } from '../services/houseBillService';
import { consolidationService } from '../services/consolidationService';
import { shipmentService } from '../services/shipmentService';
import { billOfLadingService } from '../services/billOfLadingService';
import { manifestService } from '../services/manifestService';
import { portService, containerService, vesselService, agentService, userService, documentService, settingsService } from '../services';

import { auditService } from '../services/auditService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const { currentUser, syncUsers } = useAuth();
  const { showToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [warehouseReceipts, setWarehouseReceipts] = useState([]);
  const [cargoItems, setCargoItems] = useState([]);
  const [houseBills, setHouseBills] = useState([]);
  const [consolidations, setConsolidations] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [billsOfLading, setBillsOfLading] = useState([]);
  const [manifests, setManifests] = useState([]);
  const [containers, setContainers] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [voyages, setVoyages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [ports, setPorts] = useState([]);
  const [users, setUsers] = useState([]);
  const [customDocuments, setCustomDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh all state from storage and sync with backend
  const refreshAll = useCallback(() => {
    initializeStorage();
    setCustomers(getStored(KEYS.CUSTOMERS));
    setWarehouseReceipts(getStored(KEYS.WAREHOUSE_RECEIPTS));
    setCargoItems(getStored(KEYS.CARGO));
    setHouseBills(getStored(KEYS.HOUSE_BILLS));
    setConsolidations(getStored(KEYS.CONSOLIDATIONS));
    setShipments(getStored(KEYS.SHIPMENTS));
    setBillsOfLading(getStored(KEYS.BILLS_OF_LADING));
    setManifests(getStored(KEYS.MANIFESTS));
    setContainers(getStored(KEYS.CONTAINERS));
    setVessels(getStored(KEYS.VESSELS));
    setVoyages(getStored(KEYS.VOYAGES));
    setAgents(getStored(KEYS.AGENTS));
    setPorts(getStored(KEYS.PORTS));
    setUsers(getStored(KEYS.USERS));
    setCustomDocuments(getStored(KEYS.DOCUMENTS, []));
    setAuditLogs(getStored(KEYS.AUDIT_LOGS));
    setSettings(getStored(KEYS.SETTINGS, {}));
    setIsLoading(false);
    if (syncUsers) syncUsers();

    if (localStorage.getItem('kers_token')) {
      Promise.allSettled([
        customerService.getCustomers(),
        warehouseService.getReceipts(),
        cargoService.getCargo(),
        houseBillService.getHouseBills(),
        consolidationService.getConsolidations(),
        shipmentService.getShipments(),
        billOfLadingService.getBillsOfLading(),
        manifestService.getManifests(),
        containerService.getContainers(),
        vesselService.getVessels(),
        vesselService.getVoyages(),
        agentService.getAgents(),
        portService.getPorts(),
        auditService.getLogs(),
        settingsService.getSettings(),
      ]).then(() => {
        setCustomers(getStored(KEYS.CUSTOMERS));
        setWarehouseReceipts(getStored(KEYS.WAREHOUSE_RECEIPTS));
        setCargoItems(getStored(KEYS.CARGO));
        setHouseBills(getStored(KEYS.HOUSE_BILLS));
        setConsolidations(getStored(KEYS.CONSOLIDATIONS));
        setShipments(getStored(KEYS.SHIPMENTS));
        setBillsOfLading(getStored(KEYS.BILLS_OF_LADING));
        setManifests(getStored(KEYS.MANIFESTS));
        setContainers(getStored(KEYS.CONTAINERS));
        setVessels(getStored(KEYS.VESSELS));
        setVoyages(getStored(KEYS.VOYAGES));
        setAgents(getStored(KEYS.AGENTS));
        setPorts(getStored(KEYS.PORTS));
        setAuditLogs(getStored(KEYS.AUDIT_LOGS));
        setSettings(getStored(KEYS.SETTINGS, {}));
      }).catch(() => {});
    }
  }, [syncUsers]);


  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // 1. Customers CRUD
  const createCustomer = async (customerData) => {
    const created = await customerService.createCustomer(customerData, currentUser?.name || "Warehouse Staff");
    refreshAll();
    showToast(`Customer Profile ${created.customerNumber} (${created.name}) created successfully.`, 'success', 'Customer Created');
    return created;
  };

  const updateCustomer = async (id, updates) => {
    const updated = await customerService.updateCustomer(id, updates, currentUser?.name || "Warehouse Staff");
    refreshAll();
    showToast(`Customer Profile ${id} updated successfully.`, 'success', 'Customer Updated');
    return updated;
  };

  const deleteCustomer = async (id) => {
    const success = await customerService.deleteCustomer(id, currentUser?.name || "Super Admin");
    if (success) {
      refreshAll();
      showToast(`Customer Profile ${id} deleted successfully.`, 'info', 'Customer Deleted');
    }
    return success;
  };

  // 2. Warehouse Receipts CRUD
  const createWarehouseReceipt = async (receiptData) => {
    const created = await warehouseService.createReceipt(receiptData, currentUser?.name || "Warehouse Staff");
    refreshAll();
    showToast(`Warehouse Receipt ${created.receiptNumber} intaked (${created.totalPieces} pieces, ${created.cbm} CBM).`, 'success', 'Receipt Created');
    return created;
  };

  const updateWarehouseReceipt = async (id, updates) => {
    const updated = await warehouseService.updateReceipt(id, updates, currentUser?.name || "Warehouse Staff");
    refreshAll();
    showToast(`Warehouse Receipt ${id} updated successfully.`, 'success', 'Receipt Updated');
    return updated;
  };

  const deleteWarehouseReceipt = async (id) => {
    const success = await warehouseService.deleteReceipt(id, currentUser?.name || "Warehouse Staff");
    if (success) {
      refreshAll();
      showToast(`Warehouse Receipt ${id} deleted successfully.`, 'info', 'Receipt Deleted');
    }
    return success;
  };

  // 3. Cargo Inventory CRUD
  const createCargo = async (cargoData) => {
    const created = await cargoService.createCargo(cargoData, currentUser?.name || "Warehouse Staff");
    refreshAll();
    showToast(`Cargo Unit ${created.id} registered into warehouse inventory.`, 'success', 'Cargo Intaked');
    return created;
  };

  const updateCargo = async (id, updates) => {
    const updated = await cargoService.updateCargo(id, updates, currentUser?.name || "Warehouse Staff");
    refreshAll();
    showToast(`Cargo Unit ${id} updated successfully.`, 'success', 'Cargo Updated');
    return updated;
  };

  const deleteCargo = async (id) => {
    const success = await cargoService.deleteCargo(id, currentUser?.name || "Warehouse Staff");
    if (success) {
      refreshAll();
      showToast(`Cargo Unit ${id} deleted from inventory.`, 'info', 'Cargo Deleted');
    }
    return success;
  };

  // 4. House Bills of Lading CRUD (⭐ NEW PRIMARY MODULE)
  const createHouseBill = async (hblData) => {
    const created = await houseBillService.createHouseBill(hblData, currentUser?.name || "Documentation Staff");
    refreshAll();
    showToast(`House B/L ${created.hblNumber} issued for ${created.customerName} linking ${created.warehouseReceiptIds?.length || 0} WR(s).`, 'success', 'House B/L Created');
    return created;
  };

  const updateHouseBill = async (id, updates) => {
    const updated = await houseBillService.updateHouseBill(id, updates, currentUser?.name || "Documentation Staff");
    refreshAll();
    showToast(`House B/L ${id} updated successfully.`, 'success', 'House B/L Updated');
    return updated;
  };

  const deleteHouseBill = async (id) => {
    const success = await houseBillService.deleteHouseBill(id, currentUser?.name || "Documentation Staff");
    if (success) {
      refreshAll();
      showToast(`House B/L ${id} deleted.`, 'info', 'House B/L Deleted');
    }
    return success;
  };

  const placeHBLHold = async (hblId, reason, notes) => {
    const updated = await houseBillService.placeHold(hblId, reason, notes, currentUser?.name || "Documentation Staff");
    refreshAll();
    showToast(`House B/L ${hblId} placed ON HOLD.`, 'warning', 'House B/L On Hold');
    return updated;
  };

  const clearHBLHold = async (hblId, clearNotes) => {
    const updated = await houseBillService.clearHold(hblId, currentUser?.name || "Documentation Staff", clearNotes);
    refreshAll();
    showToast(`Hold cleared for House B/L ${hblId}.`, 'success', 'House B/L Released');
    return updated;
  };

  const updateHBLStatus = async (hblId, status) => {
    const updated = await houseBillService.updateStatus(hblId, status, currentUser?.name || "Documentation Staff");
    refreshAll();
    showToast(`House B/L ${hblId} status updated to ${status}.`, 'info', 'Status Updated');
    return updated;
  };

  // 5. Consolidations CRUD
  const createConsolidation = async (consolidationData) => {
    const created = await consolidationService.createConsolidation(consolidationData, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Consolidation ${created.consolidationNumber} created. Master Shipment & Draft Master B/L generated.`, 'success', 'Consolidation Ready');
    return created;
  };

  const updateConsolidation = async (id, updates) => {
    const updated = await consolidationService.updateConsolidation(id, updates, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Consolidation ${id} updated successfully.`, 'success', 'Consolidation Updated');
    return updated;
  };

  const deleteConsolidation = async (id) => {
    const success = await consolidationService.deleteConsolidation(id, currentUser?.name || "Operations Staff");
    if (success) {
      refreshAll();
      showToast(`Consolidation ${id} deleted.`, 'info', 'Consolidation Deleted');
    }
    return success;
  };

  // 6. Shipments CRUD
  const createShipment = async (shipmentData) => {
    const created = await shipmentService.createShipment(shipmentData, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Shipment ${created.shipmentNumber} created successfully.`, 'success', 'Shipment Created');
    return created;
  };

  const updateShipment = async (id, updates) => {
    const updated = await shipmentService.updateShipment(id, updates, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Shipment ${id} updated successfully.`, 'success', 'Shipment Updated');
    return updated;
  };

  const deleteShipment = async (id) => {
    const success = await shipmentService.deleteShipment(id, currentUser?.name || "Operations Staff");
    if (success) {
      refreshAll();
      showToast(`Shipment ${id} deleted.`, 'info', 'Shipment Deleted');
    }
    return success;
  };

  // 7. Bills of Lading CRUD (Master B/L)
  const createBillOfLading = async (blData) => {
    const created = await billOfLadingService.createBillOfLading(blData, currentUser?.name || "Documentation Staff");
    refreshAll();
    showToast(`Master B/L ${created.blNumber} created successfully.`, 'success', 'Master B/L Created');
    return created;
  };

  const updateBillOfLading = async (id, updates) => {
    const updated = await billOfLadingService.updateBillOfLading(id, updates, currentUser?.name || "Documentation Staff");
    refreshAll();
    showToast(`Master B/L ${id} updated successfully.`, 'success', 'Master B/L Updated');
    return updated;
  };

  const deleteBillOfLading = async (id) => {
    const success = await billOfLadingService.deleteBillOfLading(id, currentUser?.name || "Documentation Staff");
    if (success) {
      refreshAll();
      showToast(`Master B/L ${id} deleted.`, 'info', 'Master B/L Deleted');
    }
    return success;
  };

  const placeBLHold = async (blId, reason, notes) => {
    const updated = await billOfLadingService.placeHold(blId, reason, notes, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Master B/L ${blId} has been placed ON HOLD. Document access restricted.`, 'warning', 'B/L Placed On Hold');
    return updated;
  };

  const clearBLHold = async (blId, clearNotes) => {
    const updated = await billOfLadingService.clearHold(blId, currentUser?.name || "Operations Staff", clearNotes);
    refreshAll();
    showToast(`Hold cleared for Master B/L ${blId}. Status is now RELEASED.`, 'success', 'B/L Released');
    return updated;
  };

  const updateBLStatus = async (blId, status) => {
    const updated = await billOfLadingService.updateStatus(blId, status, currentUser?.name || "Documentation Staff");
    refreshAll();
    showToast(`Master B/L ${blId} status updated to ${status}.`, 'info', 'Status Updated');
    return updated;
  };

  // 8. Manifests CRUD
  const generateManifest = async (manifestData) => {
    const created = await manifestService.generateManifest(manifestData, currentUser?.name || "Documentation Staff");
    refreshAll();
    showToast(`Shipping Manifest ${created.manifestNumber} generated successfully.`, 'success', 'Manifest Created');
    return created;
  };

  const updateManifest = async (id, updates) => {
    const updated = await manifestService.updateManifest(id, updates, currentUser?.name || "Documentation Staff");
    refreshAll();
    showToast(`Shipping Manifest ${id} updated successfully.`, 'success', 'Manifest Updated');
    return updated;
  };

  const deleteManifest = async (id) => {
    const success = await manifestService.deleteManifest(id, currentUser?.name || "Documentation Staff");
    if (success) {
      refreshAll();
      showToast(`Shipping Manifest ${id} deleted.`, 'info', 'Manifest Deleted');
    }
    return success;
  };

  // 9. Vessels & Voyages CRUD
  const createVessel = async (vesselData) => {
    const created = await vesselService.createVessel(vesselData, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Vessel ${created.name} added to fleet directory.`, 'success', 'Vessel Registered');
    return created;
  };

  const updateVessel = async (id, updates) => {
    const updated = await vesselService.updateVessel(id, updates, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Vessel ${id} updated successfully.`, 'success', 'Vessel Updated');
    return updated;
  };

  const deleteVessel = async (id) => {
    const success = await vesselService.deleteVessel(id, currentUser?.name || "Operations Staff");
    if (success) {
      refreshAll();
      showToast(`Vessel ${id} deleted from fleet.`, 'info', 'Vessel Removed');
    }
    return success;
  };

  const createVoyage = async (voyageData) => {
    const created = await vesselService.createVoyage(voyageData, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Voyage ${created.voyageNumber} scheduled successfully.`, 'success', 'Voyage Scheduled');
    return created;
  };

  const updateVoyage = async (id, updates) => {
    const updated = await vesselService.updateVoyage(id, updates, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Voyage ${id} updated successfully.`, 'success', 'Voyage Updated');
    return updated;
  };

  const deleteVoyage = async (id) => {
    const success = await vesselService.deleteVoyage(id, currentUser?.name || "Operations Staff");
    if (success) {
      refreshAll();
      showToast(`Voyage ${id} deleted.`, 'info', 'Voyage Deleted');
    }
    return success;
  };

  // 10. Containers CRUD
  const createContainer = async (containerData) => {
    const created = await containerService.createContainer(containerData, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Container ${created.containerNumber} registered into equipment fleet.`, 'success', 'Container Added');
    return created;
  };

  const updateContainer = async (id, updates) => {
    const updated = await containerService.updateContainer(id, updates, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Container ${id} updated successfully.`, 'success', 'Container Updated');
    return updated;
  };

  const deleteContainer = async (id) => {
    const success = await containerService.deleteContainer(id, currentUser?.name || "Operations Staff");
    if (success) {
      refreshAll();
      showToast(`Container ${id} deleted.`, 'info', 'Container Removed');
    }
    return success;
  };

  // 11. Agents CRUD
  const createAgent = async (agentData) => {
    const created = await agentService.createAgent(agentData, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Port Agent ${created.name} (${created.agentCode}) registered.`, 'success', 'Agent Created');
    return created;
  };

  const updateAgent = async (id, updates) => {
    const updated = await agentService.updateAgent(id, updates, currentUser?.name || "Operations Staff");
    refreshAll();
    showToast(`Port Agent ${id} updated successfully.`, 'success', 'Agent Updated');
    return updated;
  };

  const deleteAgent = async (id) => {
    const success = await agentService.deleteAgent(id, currentUser?.name || "Operations Staff");
    if (success) {
      refreshAll();
      showToast(`Port Agent ${id} deleted.`, 'info', 'Agent Removed');
    }
    return success;
  };

  // 12. Users CRUD
  const createUser = async (userData) => {
    const created = await userService.createUser(userData, currentUser?.name || "Super Admin");
    refreshAll();
    showToast(`Staff Account for ${created.name} created.`, 'success', 'User Registered');
    return created;
  };

  const updateUser = async (id, updates) => {
    const updated = await userService.updateUser(id, updates, currentUser?.name || "Super Admin");
    refreshAll();
    showToast(`Staff Account for ${id} updated.`, 'success', 'User Updated');
    return updated;
  };

  const deleteUser = async (id) => {
    const success = await userService.deleteUser(id, currentUser?.name || "Super Admin");
    if (success) {
      refreshAll();
      showToast(`Staff Account ${id} deleted.`, 'info', 'User Deleted');
    }
    return success;
  };

  // 13. Documents CRUD
  const uploadDocument = async (docData) => {
    const created = await documentService.uploadDocument(docData, currentUser?.name || "Documentation Staff");
    refreshAll();
    showToast(`Document ${created.title} uploaded successfully.`, 'success', 'Document Attached');
    return created;
  };

  const deleteDocument = async (id) => {
    const success = await documentService.deleteDocument(id, currentUser?.name || "Documentation Staff");
    if (success) {
      refreshAll();
      showToast(`Document ${id} removed.`, 'info', 'Document Deleted');
    }
    return success;
  };

  // 14. Ports & Island Destinations CRUD
  const createPort = async (portData) => {
    const created = await portService.createPort(portData, currentUser?.name || "Super Admin");
    refreshAll();
    showToast(`Island Port Destination ${created.code} (${created.name}) registered.`, 'success', 'Port Added');
    return created;
  };

  const updatePort = async (id, updates) => {
    const updated = await portService.updatePort(id, updates, currentUser?.name || "Super Admin");
    refreshAll();
    showToast(`Island Port ${id} updated successfully.`, 'success', 'Port Updated');
    return updated;
  };

  const deletePort = async (id) => {
    const success = await portService.deletePort(id, currentUser?.name || "Super Admin");
    if (success) {
      refreshAll();
      showToast(`Island Port ${id} removed.`, 'info', 'Port Deleted');
    }
    return success;
  };

  // Clear all transactional records (WRs, House B/Ls, Consolidations, MBLs, Manifests) for blank-slate testing
  const clearAllData = () => {
    clearTransactionalData();
    refreshAll();
    showToast(`All transactional records cleared! System is now a clean blank slate for testing.`, 'success', 'Data Cleared');
  };

  const updateSettings = async (newSettings) => {
    setStored(KEYS.SETTINGS, newSettings);
    setSettings(newSettings);
    await settingsService.updateAllSettings(newSettings);
    showToast(`System settings updated successfully.`, 'success', 'Settings Saved');
  };


  // Reset demo data to factory defaults
  const resetDemoData = () => {
    localStorage.clear();
    initializeStorage();
    refreshAll();
    showToast(`Demo datasets reset to factory defaults.`, 'info', 'System Reset');
  };

  return (
    <AppDataContext.Provider value={{
      customers,
      warehouseReceipts,
      cargoItems,
      houseBills,
      consolidations,
      shipments,
      billsOfLading,
      manifests,
      containers,
      vessels,
      voyages,
      agents,
      ports,
      users,
      customDocuments,
      auditLogs,
      settings,
      isLoading,
      refreshAll,
      // Customers
      createCustomer,
      updateCustomer,
      deleteCustomer,
      // Warehouse Receipts
      createWarehouseReceipt,
      updateWarehouseReceipt,
      deleteWarehouseReceipt,
      // Cargo
      createCargo,
      updateCargo,
      deleteCargo,
      // House Bills of Lading (HBL)
      createHouseBill,
      updateHouseBill,
      deleteHouseBill,
      placeHBLHold,
      clearHBLHold,
      updateHBLStatus,
      // Consolidations
      createConsolidation,
      updateConsolidation,
      deleteConsolidation,
      // Shipments
      createShipment,
      updateShipment,
      deleteShipment,
      // Bills of Lading (Master B/L)
      createBillOfLading,
      updateBillOfLading,
      deleteBillOfLading,
      placeBLHold,
      clearBLHold,
      updateBLStatus,
      // Manifests
      generateManifest,
      createManifest: generateManifest,
      updateManifest,
      deleteManifest,
      // Vessels & Voyages
      createVessel,
      updateVessel,
      deleteVessel,
      createVoyage,
      updateVoyage,
      deleteVoyage,
      // Containers
      createContainer,
      updateContainer,
      deleteContainer,
      // Agents
      createAgent,
      updateAgent,
      deleteAgent,
      // Ports
      createPort,
      updatePort,
      deletePort,
      // Users
      createUser,
      updateUser,
      deleteUser,
      // Documents
      uploadDocument,
      deleteDocument,
      // Settings & reset
      updateSettings,
      clearAllData,
      resetDemoData
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
