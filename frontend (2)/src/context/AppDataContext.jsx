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
import { portService, containerService, vesselService, agentService, userService, documentService } from '../services';
import { auditService } from '../services/auditService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { apiClient } from '../services/apiClient';

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
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Refresh all state from storage and sync with live backend
  const refreshAll = useCallback(async () => {
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

    // Sync live from PostgreSQL Backend API
    try {
      const isLive = await apiClient.checkHealth();
      setIsBackendConnected(isLive);
      if (isLive) {
        if (!apiClient.getToken()) {
          try {
            const loginRes = await apiClient.post('/auth/login', {
              email: currentUser?.email || 'elena.r@vicustoms.com',
              password: 'Password123!',
            });
            if (loginRes?.data?.token) {
              apiClient.setToken(loginRes.data.token);
            }
          } catch (loginErr) {
            console.warn('Auto-token acquisition notice:', loginErr.message);
          }
        }

        const [
          portsRes,
          settingsRes,
          customersRes,
          receiptsRes,
          cargoRes,
          consolidationsRes,
          shipmentsRes,
          billsRes,
          manifestsRes,
          houseBillsRes,
          containersRes,
          vesselsRes,
          voyagesRes,
          agentsRes,
        ] = await Promise.allSettled([
          apiClient.get('/ports'),
          apiClient.get('/settings'),
          apiClient.get('/customers'),
          apiClient.get('/warehouse-receipts'),
          apiClient.get('/cargo'),
          apiClient.get('/consolidations'),
          apiClient.get('/shipments'),
          apiClient.get('/bills-of-lading'),
          apiClient.get('/manifests'),
          apiClient.get('/house-bills'),
          apiClient.get('/containers'),
          apiClient.get('/vessels'),
          apiClient.get('/voyages'),
          apiClient.get('/agents'),
        ]);

        if (portsRes.status === 'fulfilled' && portsRes.value?.data) {
          const apiPorts = portsRes.value.data;
          setPorts(apiPorts);
          setStored(KEYS.PORTS, apiPorts);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value?.data) {
          const apiSettings = settingsRes.value.data;
          setSettings(apiSettings);
          setStored(KEYS.SETTINGS, apiSettings);
        }
        if (customersRes.status === 'fulfilled' && customersRes.value?.data) {
          const apiCust = Array.isArray(customersRes.value.data) ? customersRes.value.data : customersRes.value.data.items || [];
          setCustomers(apiCust);
          setStored(KEYS.CUSTOMERS, apiCust);
        }
        if (receiptsRes.status === 'fulfilled' && receiptsRes.value?.data) {
          const apiWR = Array.isArray(receiptsRes.value.data) ? receiptsRes.value.data : receiptsRes.value.data.items || [];
          setWarehouseReceipts(apiWR);
          setStored(KEYS.WAREHOUSE_RECEIPTS, apiWR);
        }
        if (cargoRes.status === 'fulfilled' && cargoRes.value?.data) {
          const apiCargo = Array.isArray(cargoRes.value.data) ? cargoRes.value.data : cargoRes.value.data.items || [];
          setCargoItems(apiCargo);
          setStored(KEYS.CARGO, apiCargo);
        }
        if (consolidationsRes.status === 'fulfilled' && consolidationsRes.value?.data) {
          const apiConsol = Array.isArray(consolidationsRes.value.data) ? consolidationsRes.value.data : consolidationsRes.value.data.items || [];
          setConsolidations(apiConsol);
          setStored(KEYS.CONSOLIDATIONS, apiConsol);
        }
        if (shipmentsRes.status === 'fulfilled' && shipmentsRes.value?.data) {
          const apiShip = Array.isArray(shipmentsRes.value.data) ? shipmentsRes.value.data : shipmentsRes.value.data.items || [];
          setShipments(apiShip);
          setStored(KEYS.SHIPMENTS, apiShip);
        }
        if (billsRes.status === 'fulfilled' && billsRes.value?.data) {
          const apiBills = Array.isArray(billsRes.value.data) ? billsRes.value.data : billsRes.value.data.items || [];
          setBillsOfLading(apiBills);
          setStored(KEYS.BILLS_OF_LADING, apiBills);
        }
        if (manifestsRes.status === 'fulfilled' && manifestsRes.value?.data) {
          const apiMan = Array.isArray(manifestsRes.value.data) ? manifestsRes.value.data : manifestsRes.value.data.items || [];
          setManifests(apiMan);
          setStored(KEYS.MANIFESTS, apiMan);
        }
        if (houseBillsRes.status === 'fulfilled' && houseBillsRes.value?.data) {
          const apiHBL = Array.isArray(houseBillsRes.value.data) ? houseBillsRes.value.data : houseBillsRes.value.data.items || [];
          setHouseBills(apiHBL);
          setStored(KEYS.HOUSE_BILLS, apiHBL);
        }
        if (containersRes.status === 'fulfilled' && containersRes.value?.data) {
          const apiCont = Array.isArray(containersRes.value.data) ? containersRes.value.data : containersRes.value.data.items || [];
          setContainers(apiCont);
          setStored(KEYS.CONTAINERS, apiCont);
        }
        if (vesselsRes.status === 'fulfilled' && vesselsRes.value?.data) {
          const apiVes = Array.isArray(vesselsRes.value.data) ? vesselsRes.value.data : vesselsRes.value.data.items || [];
          setVessels(apiVes);
          setStored(KEYS.VESSELS, apiVes);
        }
        if (voyagesRes.status === 'fulfilled' && voyagesRes.value?.data) {
          const apiVoy = Array.isArray(voyagesRes.value.data) ? voyagesRes.value.data : voyagesRes.value.data.items || [];
          setVoyages(apiVoy);
          setStored(KEYS.VOYAGES, apiVoy);
        }
        if (agentsRes.status === 'fulfilled' && agentsRes.value?.data) {
          const apiAgents = Array.isArray(agentsRes.value.data) ? agentsRes.value.data : agentsRes.value.data.items || [];
          setAgents(apiAgents);
          setStored(KEYS.AGENTS, apiAgents);
        }
      }
    } catch (e) {
      console.warn('Backend live sync notice:', e.message);
      setIsBackendConnected(false);
    }

    if (syncUsers) syncUsers();
  }, [syncUsers]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // 1. Customers CRUD
  const createCustomer = async (customerData) => {
    let created;
    try {
      const res = await apiClient.post('/customers', {
        name: customerData.name || customerData.companyName || "New Customer",
        companyName: customerData.companyName || customerData.name || "New Customer",
        contactPerson: customerData.contactPerson,
        email: customerData.email,
        telephone: customerData.telephone || customerData.phone,
        phone: customerData.phone || customerData.telephone,
        address: customerData.address,
        destinationPort: customerData.destinationPort,
        destinationCode: customerData.destinationCode || (customerData.destinationPort ? customerData.destinationPort.split(' - ')[0] : 'NAS'),
        taxId: customerData.taxId,
        accountType: customerData.accountType,
        creditTerms: customerData.creditTerms,
        notes: customerData.notes,
      });
      if (res?.data) {
        created = res.data;
      }
    } catch (apiErr) {
      console.warn('Backend createCustomer notice:', apiErr.message);
    }

    if (!created) {
      created = await customerService.createCustomer(customerData, currentUser?.name || "Warehouse Staff");
    }

    await refreshAll();
    showToast(`Customer Profile ${created.customerNumber || created.name} created successfully.`, 'success', 'Customer Created');
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
    let created;
    try {
      const res = await apiClient.post('/warehouse-receipts', receiptData);
      if (res?.data) created = res.data;
    } catch (e) {
      console.warn('Backend createWarehouseReceipt notice:', e.message);
    }
    if (!created) {
      created = await warehouseService.createReceipt(receiptData, currentUser?.name || "Warehouse Staff");
    }
    await refreshAll();
    showToast(`Warehouse Receipt ${created.receiptNumber || created.id} intaked.`, 'success', 'Receipt Created');
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
    let created;
    try {
      const res = await apiClient.post('/house-bills', hblData);
      if (res?.data) created = res.data;
    } catch (e) {
      console.warn('Backend createHouseBill notice:', e.message);
    }
    if (!created) {
      created = await houseBillService.createHouseBill(hblData, currentUser?.name || "Documentation Staff");
    }
    await refreshAll();
    showToast(`House B/L ${created.hblNumber || created.id} issued for ${created.customerName || 'Customer'}.`, 'success', 'House B/L Created');
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
    let created;
    try {
      const res = await apiClient.post('/consolidations', consolidationData);
      if (res?.data) created = res.data;
    } catch (e) {
      console.warn('Backend createConsolidation notice:', e.message);
    }
    if (!created) {
      created = await consolidationService.createConsolidation(consolidationData, currentUser?.name || "Operations Staff");
    }
    await refreshAll();
    showToast(`Consolidation ${created.consolidationNumber || created.id} created successfully.`, 'success', 'Consolidation Ready');
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
    let created;
    try {
      const res = await apiClient.post('/shipments', shipmentData);
      if (res?.data) created = res.data;
    } catch (e) {
      console.warn('Backend createShipment notice:', e.message);
    }
    if (!created) {
      created = await shipmentService.createShipment(shipmentData, currentUser?.name || "Operations Staff");
    }
    await refreshAll();
    showToast(`Shipment ${created.shipmentNumber || created.id} created successfully.`, 'success', 'Shipment Created');
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
    let created;
    try {
      const res = await apiClient.post('/bills-of-lading', blData);
      if (res?.data) created = res.data;
    } catch (e) {
      console.warn('Backend createBillOfLading notice:', e.message);
    }
    if (!created) {
      created = await billOfLadingService.createBillOfLading(blData, currentUser?.name || "Documentation Staff");
    }
    await refreshAll();
    showToast(`Master B/L ${created.blNumber || created.id} created successfully.`, 'success', 'Master B/L Created');
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
    let created;
    try {
      const res = await apiClient.post('/manifests', manifestData);
      if (res?.data) created = res.data;
    } catch (e) {
      console.warn('Backend generateManifest notice:', e.message);
    }
    if (!created) {
      created = await manifestService.generateManifest(manifestData, currentUser?.name || "Documentation Staff");
    }
    await refreshAll();
    showToast(`Shipping Manifest ${created.manifestNumber || created.id} generated successfully.`, 'success', 'Manifest Created');
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
    let created;
    try {
      const res = await apiClient.post('/agents', agentData);
      if (res?.data) created = res.data;
    } catch (e) {
      console.warn('Backend createAgent notice:', e.message);
    }
    if (!created) {
      created = await agentService.createAgent(agentData, currentUser?.name || "Operations Staff");
    }
    await refreshAll();
    showToast(`Port Agent ${created.name || created.code} registered.`, 'success', 'Agent Created');
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

  const updateSettings = (newSettings) => {
    setStored(KEYS.SETTINGS, newSettings);
    setSettings(newSettings);
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
      resetDemoData,
      // Live Backend State
      isBackendConnected
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
