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
import { apiClient } from '../services/apiClient';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const { currentUser, currentRole, syncUsers } = useAuth();
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
  const [activeMenuTab, setActiveMenuTab] = useState('dashboard');

  // Refresh all state from storage and sync with live backend
  const refreshAll = useCallback(async () => {
    initializeStorage();
    setCustomers(getStored(KEYS.CUSTOMERS, []));
    setWarehouseReceipts(getStored(KEYS.WAREHOUSE_RECEIPTS, []));
    setCargoItems(getStored(KEYS.CARGO, []));
    setHouseBills(getStored(KEYS.HOUSE_BILLS, []));
    setConsolidations(getStored(KEYS.CONSOLIDATIONS, []));
    setShipments(getStored(KEYS.SHIPMENTS, []));
    setBillsOfLading(getStored(KEYS.BILLS_OF_LADING, []));
    setManifests(getStored(KEYS.MANIFESTS, []));
    setContainers(getStored(KEYS.CONTAINERS, []));
    setVessels(getStored(KEYS.VESSELS, []));
    setVoyages(getStored(KEYS.VOYAGES, []));
    setAgents(getStored(KEYS.AGENTS, []));
    setPorts(getStored(KEYS.PORTS, []));
    setUsers(getStored(KEYS.USERS, []));
    setCustomDocuments(getStored(KEYS.DOCUMENTS, []));
    setAuditLogs(getStored(KEYS.AUDIT_LOGS, []));
    setSettings(getStored(KEYS.SETTINGS, {}));
    setIsLoading(false);

    // Sync live from PostgreSQL Backend API
    try {
      const isLive = await apiClient.checkHealth();
      setIsBackendConnected(isLive);
      if (isLive) {
        // Only fetch protected data if user is authenticated with a token
        if (!apiClient.getToken()) {
          return;
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
          apiClient.get('/audit', { params: { limit: 200 } }),
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
          const rawCust = Array.isArray(customersRes.value.data) ? customersRes.value.data : customersRes.value.data.items || [];
          const apiCust = rawCust.map(c => ({
            ...c,
            customerNumber: c.customerNumber || c.id,
            telephone: c.telephone || c.phone || '',
            createdDate: c.createdDate || (c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '2026-10-01'),
          }));
          setCustomers(apiCust);
          setStored(KEYS.CUSTOMERS, apiCust);
        }
        if (receiptsRes.status === 'fulfilled' && receiptsRes.value?.data) {
          const rawWR = Array.isArray(receiptsRes.value.data) ? receiptsRes.value.data : receiptsRes.value.data.items || [];
          const apiWR = rawWR.map(r => ({
            ...r,
            customer: r.customer || r.customerName || '',
            customerName: r.customerName || r.customer || '',
            cbm: r.cbm || r.totalCbm || '0.00',
            cft: r.cft || r.totalCft || '0.00',
          }));
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
          const rawHBL = Array.isArray(houseBillsRes.value.data) ? houseBillsRes.value.data : houseBillsRes.value.data.items || [];
          const apiHBL = rawHBL.map(item => ({
            ...item,
            customerName: item.customerName || (typeof item.consignee === 'object' ? item.consignee.name : item.consignee) || '',
            totalCft: item.totalCft !== undefined ? Number(item.totalCft) : 0,
            totalCbm: item.totalCbm !== undefined ? Number(item.totalCbm) : 0,
            totalWeightLbs: item.totalWeightLbs !== undefined ? Number(item.totalWeightLbs) : 0,
            warehouseReceiptIds: Array.isArray(item.warehouseReceiptIds) ? item.warehouseReceiptIds : [],
          }));
          setHouseBills(apiHBL);
          setStored(KEYS.HOUSE_BILLS, apiHBL);
        }
        if (containersRes.status === 'fulfilled' && containersRes.value) {
          const val = containersRes.value.data || containersRes.value;
          const apiCont = Array.isArray(val) ? val : val.items || [];
          if (apiCont.length > 0) { setContainers(apiCont); setStored(KEYS.CONTAINERS, apiCont); }
        }
        if (vesselsRes.status === 'fulfilled' && vesselsRes.value) {
          const val = vesselsRes.value.data || vesselsRes.value;
          const apiVes = Array.isArray(val) ? val : val.items || [];
          if (apiVes.length > 0) { setVessels(apiVes); setStored(KEYS.VESSELS, apiVes); }
        }
        if (voyagesRes.status === 'fulfilled' && voyagesRes.value) {
          const val = voyagesRes.value.data || voyagesRes.value;
          const apiVoy = Array.isArray(val) ? val : val.items || [];
          if (apiVoy.length > 0) { setVoyages(apiVoy); setStored(KEYS.VOYAGES, apiVoy); }
        }
        if (agentsRes.status === 'fulfilled' && agentsRes.value) {
          const val = agentsRes.value.data || agentsRes.value;
          const apiAgents = Array.isArray(val) ? val : val.items || [];
          if (apiAgents.length > 0) { setAgents(apiAgents); setStored(KEYS.AGENTS, apiAgents); }
        }
        const auditRes = arguments?.[0] || undefined; // checked below via auditService sync
        try {
          const liveLogs = await auditService.getLogs({ limit: 200 });
          setAuditLogs(Array.isArray(liveLogs) ? liveLogs : []);
          setStored(KEYS.AUDIT_LOGS, Array.isArray(liveLogs) ? liveLogs : []);
        } catch (audErr) {
          console.warn('[AppDataContext] Initial audit sync notice:', audErr.message);
        }
      }
    } catch (e) {
      console.warn('Backend live sync notice:', e.message);
      setIsBackendConnected(false);
    }

    if (syncUsers) syncUsers();

    try {
      await Promise.allSettled([
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
      ]);

      setCustomers(getStored(KEYS.CUSTOMERS, []));
      setWarehouseReceipts(getStored(KEYS.WAREHOUSE_RECEIPTS, []));
      setCargoItems(getStored(KEYS.CARGO, []));
      setHouseBills(getStored(KEYS.HOUSE_BILLS, []));
      setConsolidations(getStored(KEYS.CONSOLIDATIONS, []));
      setShipments(getStored(KEYS.SHIPMENTS, []));
      setBillsOfLading(getStored(KEYS.BILLS_OF_LADING, []));
      setManifests(getStored(KEYS.MANIFESTS, []));
      setContainers(getStored(KEYS.CONTAINERS, []));
      setVessels(getStored(KEYS.VESSELS, []));
      setVoyages(getStored(KEYS.VOYAGES, []));
      setAgents(getStored(KEYS.AGENTS, []));
      setPorts(getStored(KEYS.PORTS, []));
      setUsers(getStored(KEYS.USERS, []));
      setCustomDocuments(getStored(KEYS.DOCUMENTS, []));
      setAuditLogs(getStored(KEYS.AUDIT_LOGS, []));
      setSettings(getStored(KEYS.SETTINGS, {}));
    } catch (err) {
      console.warn('Backend synchronization notice:', err?.message || err);
    }
  }, [syncUsers]);

  // ON-DEMAND API Fetcher: Triggers ONLY the API corresponding to the clicked menu
  const fetchMenuApi = useCallback(async (tabName) => {
    if (!tabName) return;
    setActiveMenuTab(tabName);

    try {
      switch (tabName) {
        case 'dashboard': {
          if (currentRole === 'operations' || currentRole === 'warehouse') {
            await apiClient.get('/cfs-dashboard');
            await apiClient.get('/ops-dashboard');
          } else if (currentRole === 'documentation') {
            await apiClient.get('/docs-dashboard');
          } else if (currentRole === 'agent') {
            await apiClient.get('/agent-dashboard');
          } else {
            await apiClient.get('/admin-dashboard');
          }
          break;
        }

        case 'customers': {
          const custData = await customerService.getCustomers();
          if (Array.isArray(custData) && custData.length > 0) {
            setCustomers(custData);
            setStored(KEYS.CUSTOMERS, custData);
          }
          break;
        }

        case 'warehouse-receipts': {
          const wrList = await warehouseService.getReceipts();
          if (Array.isArray(wrList) && wrList.length > 0) {
            setWarehouseReceipts(wrList);
            setStored(KEYS.WAREHOUSE_RECEIPTS, wrList);
          }
          await apiClient.get('/labels').catch(() => {});
          break;
        }

        case 'cargo': {
          const cargoList = await cargoService.getCargo();
          if (Array.isArray(cargoList)) {
            setCargoItems(cargoList);
            setStored(KEYS.CARGO, cargoList);
          }
          break;
        }

        case 'house-bills': {
<<<<<<< HEAD
          const hbData = await houseBillService.getHouseBills();
          if (Array.isArray(hbData)) {
            setHouseBills(hbData);
            setStored(KEYS.HOUSE_BILLS, hbData);
          }
=======
          const hbRes = await apiClient.get('/house-bills');
          const list = Array.isArray(hbRes) ? hbRes : (Array.isArray(hbRes?.data) ? hbRes.data : []);
          setHouseBills(list);
          setStored(KEYS.HOUSE_BILLS, list);
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
          break;
        }

        case 'consolidations': {
<<<<<<< HEAD
          const consRes = await consolidationService.getConsolidations();
          if (Array.isArray(consRes)) {
            setConsolidations(consRes);
            setStored(KEYS.CONSOLIDATIONS, consRes);
          }
=======
          const consRes = await apiClient.get('/consolidations');
          const list = Array.isArray(consRes) ? consRes : (Array.isArray(consRes?.data) ? consRes.data : []);
          setConsolidations(list);
          setStored(KEYS.CONSOLIDATIONS, list);
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
          break;
        }

        case 'shipments': {
          try {
            const liveShipments = await shipmentService.getShipments({ limit: 200 });
            if (Array.isArray(liveShipments) && liveShipments.length > 0) {
              setShipments(liveShipments);
              setStored(KEYS.SHIPMENTS, liveShipments);
            } else {
              const shpRes = await apiClient.get('/shipments');
              const list = Array.isArray(shpRes) ? shpRes : (Array.isArray(shpRes?.data) ? shpRes.data : []);
              if (list.length > 0) {
                setShipments(list);
                setStored(KEYS.SHIPMENTS, list);
              }
            }
          } catch (e) {
            console.warn('[AppDataContext] Failed to load shipments:', e.message);
          }
          break;
        }

        case 'bills-of-lading': {
<<<<<<< HEAD
          const liveBLs = await billOfLadingService.getBillsOfLading();
          if (Array.isArray(liveBLs)) {
            setBillsOfLading(liveBLs);
            setStored(KEYS.BILLS_OF_LADING, liveBLs);
          }
=======
          const blRes = await apiClient.get('/bills-of-lading');
          const list = Array.isArray(blRes) ? blRes : (Array.isArray(blRes?.data) ? blRes.data : []);
          setBillsOfLading(list);
          setStored(KEYS.BILLS_OF_LADING, list);
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
          break;
        }

        case 'manifests': {
<<<<<<< HEAD
          try {
            const liveManifests = await manifestService.getManifests();
            if (Array.isArray(liveManifests)) {
              setManifests(liveManifests);
              setStored(KEYS.MANIFESTS, liveManifests);
            }
          } catch (e) {
            console.warn('[AppDataContext] Failed to load manifests:', e.message);
          }
=======
          const mnfRes = await apiClient.get('/manifests');
          const list = Array.isArray(mnfRes) ? mnfRes : (Array.isArray(mnfRes?.data) ? mnfRes.data : []);
          setManifests(list);
          setStored(KEYS.MANIFESTS, list);
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
          break;
        }

        case 'containers': {
          const cntRes = await apiClient.get('/containers');
          if (Array.isArray(cntRes) && cntRes.length > 0) {
            setContainers(cntRes);
            setStored(KEYS.CONTAINERS, cntRes);
          }
          break;
        }

        case 'vessels': {
          const vslList = await vesselService.getVessels();
          const voyList = await vesselService.getVoyages();
          if (Array.isArray(vslList)) {
            setVessels(vslList);
            setStored(KEYS.VESSELS, vslList);
          }
          if (Array.isArray(voyList)) {
            setVoyages(voyList);
            setStored(KEYS.VOYAGES, voyList);
          }
          await apiClient.get('/containers-vessels').catch(() => {});
          break;
        }

        case 'tracking': {
          await apiClient.get('/tracking/TRK-VI-994819').catch(() => {});
          break;
        }

        case 'documents': {
          const docRes = await apiClient.get('/documents');
          if (Array.isArray(docRes) && docRes.length > 0) {
            setCustomDocuments(docRes);
            setStored(KEYS.DOCUMENTS, docRes);
          }
          await apiClient.get('/documents-archive').catch(() => {});
          break;
        }

        case 'agents': {
          const agtRes = await apiClient.get('/agents');
          if (Array.isArray(agtRes) && agtRes.length > 0) {
            setAgents(agtRes);
            setStored(KEYS.AGENTS, agtRes);
          }
          break;
        }

        case 'users': {
          const usrRes = await apiClient.get('/users');
          const rawUsers = Array.isArray(usrRes) ? usrRes : (usrRes?.data || []);
          if (Array.isArray(rawUsers) && rawUsers.length > 0) {
            setUsers(rawUsers);
            setStored(KEYS.USERS, rawUsers);
          }
          await apiClient.get('/users-roles').catch(() => {});
          break;
        }

        case 'audit': {
          try {
            const logs = await auditService.getLogs({ limit: 200 });
            setAuditLogs(Array.isArray(logs) ? logs : []);
            setStored(KEYS.AUDIT_LOGS, Array.isArray(logs) ? logs : []);
          } catch (e) {
            console.warn('[AppDataContext] Failed to load audit logs from API:', e.message);
          }
          await apiClient.get('/audit-trail').catch(() => {});
          break;
        }

        case 'history': {
          try {
            const liveShipments = await shipmentService.getShipments({ limit: 200 });
            if (Array.isArray(liveShipments)) {
              setShipments(liveShipments);
              setStored(KEYS.SHIPMENTS, liveShipments);
            }
          } catch (e) {
            console.warn('[AppDataContext] Failed to load shipment history from API:', e.message);
          }
          await apiClient.get('/shipment-history').catch(() => {});
          break;
        }

        case 'settings': {
          try {
            const liveSettings = await settingsService.getSettings();
            if (liveSettings && Object.keys(liveSettings).length > 0) {
              setSettings(liveSettings);
            }
            const livePorts = await portService.getPorts();
            if (Array.isArray(livePorts) && livePorts.length > 0) {
              setPorts(livePorts);
            }
          } catch (e) {
            console.warn('[AppDataContext] Failed to load settings from API:', e.message);
          }
          break;
        }

        case 'ports': {
          try {
            const livePorts = await portService.getPorts();
            if (Array.isArray(livePorts) && livePorts.length > 0) {
              setPorts(livePorts);
            }
          } catch (e) {
            console.warn('[AppDataContext] Failed to load ports from API:', e.message);
          }
          break;
        }

        case 'agent-dashboard': {
          await apiClient.get('/agent-dashboard').catch(() => {});
          break;
        }

        case 'agent-shipments': {
          await apiClient.get('/assigned-shipments').catch(() => {});
          break;
        }

        case 'agent-documents': {
          await apiClient.get('/agent-documents').catch(() => {});
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.warn(`Menu API call for ${tabName} notice:`, err.message);
    }
  }, [currentRole]);

  useEffect(() => {
    refreshAll();
    // Fetch initial active menu API on mount
    fetchMenuApi(activeMenuTab);
  }, []);

  // 1. Customers CRUD
  const createCustomer = async (customerData) => {
    try {
      const created = await customerService.createCustomer(customerData, currentUser?.name || "Warehouse Staff");
      await refreshAll();
      showToast(`Customer Profile ${created.customerNumber || created.name} created successfully.`, 'success', 'Customer Created');
      return created;
    } catch (err) {
      showToast(err.message || 'Failed to create customer profile', 'error', 'Creation Error');
      throw err;
    }
  };

  const updateCustomer = async (id, updates) => {
    try {
      const updated = await customerService.updateCustomer(id, updates, currentUser?.name || "Warehouse Staff");
      await refreshAll();
      showToast(`Customer Profile ${id} updated successfully.`, 'success', 'Customer Updated');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update customer profile', 'error', 'Update Error');
      throw err;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      setCustomers(prev => prev.filter(c => c.id !== id && c.customerNumber !== id && c.accountNumber !== id));
      const success = await customerService.deleteCustomer(id, currentUser?.name || "Super Admin");
      if (success) {
        await refreshAll();
        showToast(`Customer Profile ${id} deleted successfully.`, 'info', 'Customer Deleted');
      }
      return success;
    } catch (err) {
      await refreshAll();
      showToast(err.message || 'Failed to delete customer profile', 'error', 'Delete Error');
      throw err;
    }
  };

  // 2. Warehouse Receipts CRUD
  const createWarehouseReceipt = async (receiptData) => {
    try {
      const created = await warehouseService.createReceipt(receiptData, currentUser?.name || "Warehouse Staff");
      await refreshAll();
      showToast(`Warehouse Receipt ${created.receiptNumber || created.id} intaked.`, 'success', 'Receipt Created');
      return created;
    } catch (err) {
      showToast(err.message || 'Failed to intake warehouse receipt', 'error', 'Intake Failed');
      throw err;
    }
  };

  const updateWarehouseReceipt = async (id, updates) => {
    try {
      const updated = await warehouseService.updateReceipt(id, updates, currentUser?.name || "Warehouse Staff");
      await refreshAll();
      showToast(`Warehouse Receipt ${id} updated successfully.`, 'success', 'Receipt Updated');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update warehouse receipt', 'error', 'Update Failed');
      throw err;
    }
  };

  const deleteWarehouseReceipt = async (id) => {
    try {
      setWarehouseReceipts(prev => prev.filter(r => r.id !== id && r.receiptNumber !== id));
      const success = await warehouseService.deleteReceipt(id, currentUser?.name || "Warehouse Staff");
      if (success) {
        await refreshAll();
        showToast(`Warehouse Receipt ${id} deleted successfully.`, 'info', 'Receipt Deleted');
      }
      return success;
    } catch (err) {
      await refreshAll();
      showToast(err.message || 'Failed to delete warehouse receipt', 'error', 'Delete Failed');
      throw err;
    }
  };

  // 3. Cargo Inventory CRUD
  const createCargo = async (cargoData) => {
    try {
      const created = await cargoService.createCargo(cargoData, currentUser?.name || "Warehouse Staff");
      await fetchMenuApi('cargo');
      await refreshAll();
      showToast(`Cargo Unit ${created.cargoNumber || created.id} registered into warehouse inventory.`, 'success', 'Cargo Intaked');
      return created;
    } catch (err) {
      await refreshAll();
      showToast(err.message || 'Failed to intake cargo unit', 'error', 'Intake Failed');
      throw err;
    }
  };

  const updateCargo = async (id, updates) => {
    try {
      const updated = await cargoService.updateCargo(id, updates, currentUser?.name || "Warehouse Staff");
      await fetchMenuApi('cargo');
      await refreshAll();
      showToast(`Cargo Unit ${updates.cargoNumber || id} updated successfully.`, 'success', 'Cargo Updated');
      return updated;
    } catch (err) {
      await refreshAll();
      showToast(err.message || 'Failed to update cargo unit', 'error', 'Update Failed');
      throw err;
    }
  };

  const deleteCargo = async (id) => {
    try {
      setCargoItems(prev => prev.filter(c => c.id !== id && c.cargoNumber !== id));
      const success = await cargoService.deleteCargo(id, currentUser?.name || "Warehouse Staff");
      if (success) {
        await fetchMenuApi('cargo');
        await refreshAll();
        showToast(`Cargo Unit ${id} deleted from inventory.`, 'info', 'Cargo Deleted');
      }
      return success;
    } catch (err) {
      await refreshAll();
      showToast(err.message || 'Failed to delete cargo unit', 'error', 'Delete Failed');
      throw err;
    }
  };

  // 4. House Bills of Lading CRUD
  const createHouseBill = async (hblData) => {
    const created = await houseBillService.createHouseBill(hblData, currentUser?.name || "Documentation Staff");
    if (created) {
      setHouseBills(prev => [created, ...prev.filter(h => h.id !== created.id && h.hblNumber !== created.hblNumber)]);
    }
<<<<<<< HEAD
    await fetchMenuApi('house-bills');
=======
    if (created) {
      setHouseBills(prev => [
        created,
        ...(Array.isArray(prev) ? prev.filter(h => h.id !== created.id && h.hblNumber !== created.hblNumber) : [])
      ]);
    }
    fetchMenuApi('house-bills');
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
    await refreshAll();
    showToast(`House B/L ${created?.hblNumber || created?.id} issued for ${created?.customerName || 'Customer'}.`, 'success', 'House B/L Created');
    return created;
  };

  const updateHouseBill = async (id, updates) => {
<<<<<<< HEAD
    const updated = await houseBillService.updateHouseBill(id, updates, currentUser?.name || "Documentation Staff");
    if (updated) {
      setHouseBills(prev => prev.map(h => (h.id === id || h.hblNumber === id ? { ...h, ...updated } : h)));
    }
    await fetchMenuApi('house-bills');
=======
    let updated;
    try {
      const res = await apiClient.patch(`/house-bills/${id}`, updates);
      if (res?.data) updated = res.data;
    } catch (e) {
      console.warn('Backend updateHouseBill notice:', e.message);
    }
    if (!updated) {
      updated = await houseBillService.updateHouseBill(id, updates, currentUser?.name || "Documentation Staff");
    }
    if (updated) {
      setHouseBills(prev => prev.map(h => (h.id === id || h.hblNumber === id ? { ...h, ...updated } : h)));
    }
    fetchMenuApi('house-bills');
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
    await refreshAll();
    showToast(`House B/L ${updated?.hblNumber || id} updated successfully.`, 'success', 'House B/L Updated');
    return updated;
  };

  const deleteHouseBill = async (id) => {
    setHouseBills(prev => prev.filter(h => h.id !== id && h.hblNumber !== id));
<<<<<<< HEAD
    const success = await houseBillService.deleteHouseBill(id, currentUser?.name || "Documentation Staff");
    await fetchMenuApi('house-bills');
    await refreshAll();
    if (success) {
      showToast(`House B/L ${id} deleted.`, 'info', 'House B/L Deleted');
=======
    try {
      await apiClient.delete(`/house-bills/${id}`);
    } catch (e) {
      console.warn('Backend deleteHouseBill notice:', e.message);
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
    }
    const success = await houseBillService.deleteHouseBill(id, currentUser?.name || "Documentation Staff");
    fetchMenuApi('house-bills');
    await refreshAll();
    showToast(`House B/L ${id} deleted.`, 'info', 'House B/L Deleted');
    return success;
  };

  const placeHBLHold = async (hblId, reason, notes) => {
    const updated = await houseBillService.placeHold(hblId, reason, notes, currentUser?.name || "Documentation Staff");
    if (updated) {
      setHouseBills(prev => prev.map(h => (h.id === hblId || h.hblNumber === hblId ? updated : h)));
    }
    await fetchMenuApi('house-bills');
    await refreshAll();
    showToast(`House B/L ${hblId} placed ON HOLD.`, 'warning', 'House B/L On Hold');
    return updated;
  };

  const clearHBLHold = async (hblId, clearNotes) => {
    const updated = await houseBillService.clearHold(hblId, currentUser?.name || "Documentation Staff", clearNotes);
    if (updated) {
      setHouseBills(prev => prev.map(h => (h.id === hblId || h.hblNumber === hblId ? updated : h)));
    }
    await fetchMenuApi('house-bills');
    await refreshAll();
    showToast(`Hold cleared for House B/L ${hblId}.`, 'success', 'House B/L Released');
    return updated;
  };

  const updateHBLStatus = async (hblId, status) => {
    const updated = await houseBillService.updateStatus(hblId, status, currentUser?.name || "Documentation Staff");
    if (updated) {
      setHouseBills(prev => prev.map(h => (h.id === hblId || h.hblNumber === hblId ? updated : h)));
    }
    await fetchMenuApi('house-bills');
    await refreshAll();
    showToast(`House B/L ${hblId} status updated to ${status}.`, 'info', 'Status Updated');
    return updated;
  };

  // 5. Consolidations CRUD
  const createConsolidation = async (consolidationData) => {
<<<<<<< HEAD
    const created = await consolidationService.createConsolidation(consolidationData, currentUser?.name || "Operations Staff");
    await fetchMenuApi('consolidations');
    await refreshAll();
    showToast(`Consolidation ${created?.consolidationNumber || created?.id || 'Record'} created successfully.`, 'success', 'Consolidation Ready');
=======
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
    if (created) {
      setConsolidations(prev => [
        created,
        ...(Array.isArray(prev) ? prev.filter(c => c.id !== created.id && c.consolidationNumber !== created.consolidationNumber) : [])
      ]);
    }
    await refreshAll();
    showToast(`Consolidation ${created?.consolidationNumber || created?.id} created successfully.`, 'success', 'Consolidation Ready');
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
    return created;
  };

  const updateConsolidation = async (id, updates) => {
    const updated = await consolidationService.updateConsolidation(id, updates, currentUser?.name || "Operations Staff");
    await fetchMenuApi('consolidations');
    await refreshAll();
    showToast(`Consolidation ${id} updated successfully.`, 'success', 'Consolidation Updated');
    return updated;
  };

  const deleteConsolidation = async (id) => {
    setConsolidations(prev => prev.filter(c => c.id !== id && c.consolidationNumber !== id));
    const success = await consolidationService.deleteConsolidation(id, currentUser?.name || "Operations Staff");
    if (success) {
      await fetchMenuApi('consolidations');
      await refreshAll();
      showToast(`Consolidation ${id} deleted.`, 'info', 'Consolidation Deleted');
    }
    return success;
  };

  // 6. Shipments CRUD
  const createShipment = async (shipmentData) => {
<<<<<<< HEAD
    try {
      const created = await shipmentService.createShipment(shipmentData, currentUser?.name || "Super Admin");
      await fetchMenuApi('shipments');
      await refreshAll();
      showToast(`Shipment ${created.shipmentNumber || created.id} created successfully.`, 'success', 'Shipment Created');
      return created;
    } catch (err) {
      showToast(err?.message || 'Failed to create shipment', 'error', 'Creation Error');
      throw err;
    }
=======
    let created;
    const payload = {
      ...shipmentData,
      agentId: shipmentData.agentId || currentUser?.agentId || null,
      agentName: shipmentData.agentName || currentUser?.department || currentUser?.name || 'Nassau Freight Logistics Ltd',
    };
    try {
      const res = await apiClient.post('/shipments', payload);
      if (res?.data) created = res.data;
    } catch (e) {
      console.warn('Backend createShipment notice:', e.message);
    }
    if (!created) {
      created = await shipmentService.createShipment(payload, currentUser?.name || "Operations Staff");
    }
    if (created) {
      setShipments(prev => [created, ...(Array.isArray(prev) ? prev.filter(s => s.id !== created.id && s.shipmentNumber !== created.shipmentNumber) : [])]);
    }
    await refreshAll();
    showToast(`Shipment ${created.shipmentNumber || created.id} created successfully.`, 'success', 'Shipment Created');
    return created;
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
  };

  const updateShipment = async (id, updates) => {
    try {
      const updated = await shipmentService.updateShipment(id, updates, currentUser?.name || "Super Admin");
      await fetchMenuApi('shipments');
      await refreshAll();
      showToast(`Shipment ${updated?.shipmentNumber || id} updated successfully.`, 'success', 'Shipment Updated');
      return updated;
    } catch (err) {
      showToast(err?.message || 'Failed to update shipment', 'error', 'Update Error');
      throw err;
    }
  };

  const deleteShipment = async (id) => {
    try {
      setShipments(prev => prev.filter(s => s.id !== id && s.shipmentNumber !== id));
      const success = await shipmentService.deleteShipment(id, currentUser?.name || "Super Admin");
      if (success) {
        await fetchMenuApi('shipments');
        await refreshAll();
        showToast(`Shipment ${id} deleted successfully.`, 'info', 'Shipment Deleted');
      }
      return success;
    } catch (err) {
      await refreshAll();
      showToast(err?.message || 'Failed to delete shipment', 'error', 'Delete Error');
      throw err;
    }
  };

  // 7. Bills of Lading CRUD (Master B/L)
  const createBillOfLading = async (blData) => {
    try {
      const created = await billOfLadingService.createBillOfLading(blData, currentUser?.name || "Documentation Staff");
      await fetchMenuApi('bills-of-lading');
      await refreshAll();
      showToast(`Master B/L ${created?.blNumber || created?.id} created successfully.`, 'success', 'Master B/L Created');
      return created;
    } catch (err) {
      showToast(err?.message || 'Failed to create Master B/L', 'error', 'Creation Failed');
      throw err;
    }
<<<<<<< HEAD
  };

  const updateBillOfLading = async (id, updates) => {
    try {
      const updated = await billOfLadingService.updateBillOfLading(id, updates, currentUser?.name || "Documentation Staff");
      await fetchMenuApi('bills-of-lading');
      await refreshAll();
      showToast(`Master B/L ${updated?.blNumber || id} updated successfully.`, 'success', 'Master B/L Updated');
      return updated;
    } catch (err) {
      showToast(err?.message || 'Failed to update Master B/L', 'error', 'Update Failed');
      throw err;
    }
  };

  const deleteBillOfLading = async (id) => {
    try {
      setBillsOfLading(prev => prev.filter(b => b.id !== id && b.blNumber !== id));
      const success = await billOfLadingService.deleteBillOfLading(id, currentUser?.name || "Documentation Staff");
      await fetchMenuApi('bills-of-lading');
      await refreshAll();
      if (success) {
        showToast(`Master B/L ${id} deleted.`, 'info', 'Master B/L Deleted');
      }
      return success;
    } catch (err) {
      await refreshAll();
      showToast(err?.message || 'Failed to delete Master B/L', 'error', 'Delete Failed');
      throw err;
    }
  };

  const placeBLHold = async (blId, reason, notes) => {
    try {
      const updated = await billOfLadingService.placeHold(blId, reason, notes, currentUser?.name || "Operations Staff");
      await fetchMenuApi('bills-of-lading');
      await refreshAll();
      showToast(`Master B/L ${blId} has been placed ON HOLD. Document access restricted.`, 'warning', 'B/L Placed On Hold');
      return updated;
    } catch (err) {
      showToast(err?.message || 'Failed to place B/L on hold', 'error', 'Hold Failed');
      throw err;
    }
  };

  const clearBLHold = async (blId, clearNotes) => {
    try {
      const updated = await billOfLadingService.clearHold(blId, currentUser?.name || "Operations Staff", clearNotes);
      await fetchMenuApi('bills-of-lading');
      await refreshAll();
      showToast(`Hold cleared for Master B/L ${blId}. Status is now RELEASED.`, 'success', 'B/L Released');
      return updated;
    } catch (err) {
      showToast(err?.message || 'Failed to release B/L', 'error', 'Release Failed');
      throw err;
    }
  };

  const updateBLStatus = async (blId, status) => {
    try {
      const updated = await billOfLadingService.updateStatus(blId, status, currentUser?.name || "Documentation Staff");
      await fetchMenuApi('bills-of-lading');
      await refreshAll();
      showToast(`Master B/L ${blId} status updated to ${status}.`, 'info', 'Status Updated');
      return updated;
    } catch (err) {
      showToast(err?.message || 'Failed to update B/L status', 'error', 'Status Update Failed');
      throw err;
    }
=======
    if (!created) {
      created = await billOfLadingService.createBillOfLading(blData, currentUser?.name || "Documentation Staff");
    }
    if (created) {
      setBillsOfLading(prev => [
        created,
        ...(Array.isArray(prev) ? prev.filter(b => b.id !== created.id && b.blNumber !== created.blNumber) : [])
      ]);
    }
    fetchMenuApi('bills-of-lading');
    await refreshAll();
    showToast(`Master B/L ${created?.blNumber || created?.id} created successfully.`, 'success', 'Master B/L Created');
    return created;
  };

  const updateBillOfLading = async (id, updates) => {
    let updated;
    try {
      const res = await apiClient.patch(`/bills-of-lading/${id}`, updates);
      if (res?.data) updated = res.data;
    } catch (e) {
      console.warn('Backend updateBillOfLading notice:', e.message);
    }
    if (!updated) {
      updated = await billOfLadingService.updateBillOfLading(id, updates, currentUser?.name || "Documentation Staff");
    }
    if (updated) {
      setBillsOfLading(prev => prev.map(b => (b.id === id || b.blNumber === id ? { ...b, ...updated } : b)));
    }
    fetchMenuApi('bills-of-lading');
    await refreshAll();
    showToast(`Master B/L ${id} updated successfully.`, 'success', 'Master B/L Updated');
    return updated;
  };

  const deleteBillOfLading = async (id) => {
    setBillsOfLading(prev => prev.filter(b => b.id !== id && b.blNumber !== id));
    try {
      await apiClient.delete(`/bills-of-lading/${id}`);
    } catch (e) {
      console.warn('Backend deleteBillOfLading notice:', e.message);
    }
    const success = await billOfLadingService.deleteBillOfLading(id, currentUser?.name || "Documentation Staff");
    fetchMenuApi('bills-of-lading');
    await refreshAll();
    showToast(`Master B/L ${id} deleted.`, 'info', 'Master B/L Deleted');
    return success;
  };

  const placeBLHold = async (blId, reason, notes) => {
    let updated;
    try {
      const res = await apiClient.post(`/bills-of-lading/${blId}/hold`, { reason, holdNotes: notes });
      if (res?.data) updated = res.data;
    } catch (e) {
      console.warn('Backend placeBLHold notice:', e.message);
    }
    if (!updated) {
      updated = await billOfLadingService.placeHold(blId, reason, notes, currentUser?.name || "Operations Staff");
    }
    if (updated) {
      setBillsOfLading(prev => prev.map(b => (b.id === blId || b.blNumber === blId ? { ...b, ...updated } : b)));
    }
    fetchMenuApi('bills-of-lading');
    await refreshAll();
    showToast(`Master B/L ${blId} has been placed ON HOLD. Document access restricted.`, 'warning', 'B/L Placed On Hold');
    return updated;
  };

  const clearBLHold = async (blId, clearNotes) => {
    let updated;
    try {
      const res = await apiClient.post(`/bills-of-lading/${blId}/release`, { notes: clearNotes });
      if (res?.data) updated = res.data;
    } catch (e) {
      console.warn('Backend clearBLHold notice:', e.message);
    }
    if (!updated) {
      updated = await billOfLadingService.clearHold(blId, currentUser?.name || "Operations Staff", clearNotes);
    }
    if (updated) {
      setBillsOfLading(prev => prev.map(b => (b.id === blId || b.blNumber === blId ? { ...b, ...updated } : b)));
    }
    fetchMenuApi('bills-of-lading');
    await refreshAll();
    showToast(`Hold cleared for Master B/L ${blId}. Status is now RELEASED.`, 'success', 'B/L Released');
    return updated;
  };

  const updateBLStatus = async (blId, status) => {
    let updated;
    try {
      const res = await apiClient.patch(`/bills-of-lading/${blId}`, { status });
      if (res?.data) updated = res.data;
    } catch (e) {
      console.warn('Backend updateBLStatus notice:', e.message);
    }
    if (!updated) {
      updated = await billOfLadingService.updateStatus(blId, status, currentUser?.name || "Documentation Staff");
    }
    if (updated) {
      setBillsOfLading(prev => prev.map(b => (b.id === blId || b.blNumber === blId ? { ...b, ...updated } : b)));
    }
    fetchMenuApi('bills-of-lading');
    await refreshAll();
    showToast(`Master B/L ${blId} status updated to ${status}.`, 'info', 'Status Updated');
    return updated;
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
  };

  // 8. Manifests CRUD
  const generateManifest = async (manifestData) => {
    try {
      const created = await manifestService.generateManifest(manifestData, currentUser?.name || "Documentation Staff");
      await fetchMenuApi('manifests');
      await refreshAll();
      showToast(`Shipping Manifest ${created.manifestNumber || created.id} generated successfully.`, 'success', 'Manifest Created');
      return created;
    } catch (err) {
      showToast(err?.message || 'Failed to generate manifest', 'error', 'Creation Error');
      throw err;
    }
<<<<<<< HEAD
  };

  const updateManifest = async (id, updates) => {
    try {
      const updated = await manifestService.updateManifest(id, updates, currentUser?.name || "Documentation Staff");
      await fetchMenuApi('manifests');
      await refreshAll();
      showToast(`Shipping Manifest ${id} updated successfully.`, 'success', 'Manifest Updated');
      return updated;
    } catch (err) {
      showToast(err?.message || 'Failed to update manifest', 'error', 'Update Error');
      throw err;
    }
  };

  const deleteManifest = async (id) => {
    try {
      setManifests(prev => prev.filter(m => m.id !== id && m.manifestNumber !== id));
      const success = await manifestService.deleteManifest(id, currentUser?.name || "Documentation Staff");
      if (success) {
        await fetchMenuApi('manifests');
        await refreshAll();
        showToast(`Shipping Manifest ${id} deleted.`, 'info', 'Manifest Deleted');
      }
      return success;
    } catch (err) {
      await refreshAll();
      showToast(err?.message || 'Failed to delete manifest', 'error', 'Delete Error');
      throw err;
    }
=======
    if (!created) {
      created = await manifestService.generateManifest(manifestData, currentUser?.name || "Documentation Staff");
    }
    if (created) {
      setManifests(prev => [
        created,
        ...(Array.isArray(prev) ? prev.filter(m => m.id !== created.id && m.manifestNumber !== created.manifestNumber) : [])
      ]);
    }
    await refreshAll();
    showToast(`Shipping Manifest ${created?.manifestNumber || created?.id} generated successfully.`, 'success', 'Manifest Created');
    return created;
  };

  const updateManifest = async (id, updates) => {
    let updated;
    try {
      const res = await apiClient.patch(`/manifests/${id}`, updates);
      if (res?.data) updated = res.data;
    } catch (e) {
      console.warn('Backend updateManifest notice:', e.message);
    }
    if (!updated) {
      updated = await manifestService.updateManifest(id, updates, currentUser?.name || "Documentation Staff");
    }
    if (updated) {
      setManifests(prev => prev.map(m => (m.id === id || m.manifestNumber === id ? { ...m, ...updated } : m)));
    }
    fetchMenuApi('manifests');
    await refreshAll();
    showToast(`Shipping Manifest ${id} updated successfully.`, 'success', 'Manifest Updated');
    return updated;
  };

  const deleteManifest = async (id) => {
    setManifests(prev => prev.filter(m => m.id !== id && m.manifestNumber !== id));
    try {
      await apiClient.delete(`/manifests/${id}`);
    } catch (e) {
      console.warn('Backend deleteManifest notice:', e.message);
    }
    await manifestService.deleteManifest(id, currentUser?.name || "Documentation Staff");
    fetchMenuApi('manifests');
    await refreshAll();
    showToast(`Shipping Manifest ${id} deleted.`, 'info', 'Manifest Deleted');
    return true;
>>>>>>> ceb12aa2c2c32ba96a8c32e6b6bee67659416841
  };

  // 9. Vessels & Voyages CRUD
  const createVessel = async (vesselData) => {
    try {
      const created = await vesselService.createVessel(vesselData, currentUser?.name || "Operations Staff");
      await fetchMenuApi('vessels');
      await refreshAll();
      showToast(`Vessel ${created.name} added to fleet directory.`, 'success', 'Vessel Registered');
      return created;
    } catch (err) {
      showToast(err?.message || 'Failed to create vessel', 'error', 'Creation Error');
      throw err;
    }
  };

  const updateVessel = async (id, updates) => {
    try {
      const updated = await vesselService.updateVessel(id, updates, currentUser?.name || "Operations Staff");
      await fetchMenuApi('vessels');
      await refreshAll();
      showToast(`Vessel ${id} updated successfully.`, 'success', 'Vessel Updated');
      return updated;
    } catch (err) {
      showToast(err?.message || 'Failed to update vessel', 'error', 'Update Error');
      throw err;
    }
  };

  const deleteVessel = async (id) => {
    try {
      setVessels(prev => prev.filter(v => v.id !== id && v.name !== id));
      const success = await vesselService.deleteVessel(id, currentUser?.name || "Operations Staff");
      if (success) {
        await fetchMenuApi('vessels');
        await refreshAll();
        showToast(`Vessel ${id} deleted from fleet.`, 'info', 'Vessel Removed');
      }
      return success;
    } catch (err) {
      showToast(err?.message || 'Failed to delete vessel', 'error', 'Delete Error');
      throw err;
    }
  };

  const createVoyage = async (voyageData) => {
    try {
      const created = await vesselService.createVoyage(voyageData, currentUser?.name || "Operations Staff");
      await fetchMenuApi('vessels');
      await refreshAll();
      showToast(`Voyage ${created.voyageNumber} scheduled successfully.`, 'success', 'Voyage Scheduled');
      return created;
    } catch (err) {
      showToast(err?.message || 'Failed to schedule voyage', 'error', 'Schedule Error');
      throw err;
    }
  };

  const updateVoyage = async (id, updates) => {
    try {
      const updated = await vesselService.updateVoyage(id, updates, currentUser?.name || "Operations Staff");
      await fetchMenuApi('vessels');
      await refreshAll();
      showToast(`Voyage ${id} updated successfully.`, 'success', 'Voyage Updated');
      return updated;
    } catch (err) {
      showToast(err?.message || 'Failed to update voyage', 'error', 'Update Error');
      throw err;
    }
  };

  const deleteVoyage = async (id) => {
    try {
      setVoyages(prev => prev.filter(v => v.id !== id && v.voyageNumber !== id));
      const success = await vesselService.deleteVoyage(id, currentUser?.name || "Operations Staff");
      if (success) {
        await fetchMenuApi('vessels');
        await refreshAll();
        showToast(`Voyage ${id} deleted.`, 'info', 'Voyage Deleted');
      }
      return success;
    } catch (err) {
      showToast(err?.message || 'Failed to delete voyage', 'error', 'Delete Error');
      throw err;
    }
  };

  // 10. Containers CRUD
  const createContainer = async (containerData) => {
    const created = await containerService.createContainer(containerData, currentUser?.name || "Operations Staff");
    fetchMenuApi('containers');
    await refreshAll();
    showToast(`Container ${created.containerNumber} registered into equipment fleet.`, 'success', 'Container Added');
    return created;
  };

  const updateContainer = async (id, updates) => {
    const updated = await containerService.updateContainer(id, updates, currentUser?.name || "Operations Staff");
    fetchMenuApi('containers');
    await refreshAll();
    showToast(`Container ${id} updated successfully.`, 'success', 'Container Updated');
    return updated;
  };

  const deleteContainer = async (id) => {
    setContainers(prev => prev.filter(c => c.id !== id && c.containerNumber !== id));
    const success = await containerService.deleteContainer(id, currentUser?.name || "Operations Staff");
    if (success) {
      fetchMenuApi('containers');
      await refreshAll();
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
    fetchMenuApi('agents');
    await refreshAll();
    showToast(`Port Agent ${id} updated successfully.`, 'success', 'Agent Updated');
    return updated;
  };

  const deleteAgent = async (id) => {
    setAgents(prev => prev.filter(a => a.id !== id && a.agentCode !== id));
    const success = await agentService.deleteAgent(id, currentUser?.name || "Operations Staff");
    if (success) {
      fetchMenuApi('agents');
      await refreshAll();
      showToast(`Port Agent ${id} deleted.`, 'info', 'Agent Removed');
    }
    return success;
  };

  // 12. Users CRUD
  const createUser = async (userData) => {
    const created = await userService.createUser(userData, currentUser?.name || "Super Admin");
    fetchMenuApi('users');
    await refreshAll();
    showToast(`Staff Account for ${created.name} created.`, 'success', 'User Registered');
    return created;
  };

  const updateUser = async (id, updates) => {
    const updated = await userService.updateUser(id, updates, currentUser?.name || "Super Admin");
    fetchMenuApi('users');
    await refreshAll();
    showToast(`Staff Account for ${id} updated.`, 'success', 'User Updated');
    return updated;
  };

  const deleteUser = async (id) => {
    setUsers(prev => prev.filter(u => u.id !== id && u.email !== id));
    const success = await userService.deleteUser(id, currentUser?.name || "Super Admin");
    if (success) {
      fetchMenuApi('users');
      await refreshAll();
      showToast(`Staff Account ${id} deleted.`, 'info', 'User Deleted');
    }
    return success;
  };

  // 13. Documents CRUD
  const uploadDocument = async (docData) => {
    const created = await documentService.uploadDocument(docData, currentUser?.name || "Documentation Staff");
    fetchMenuApi('documents');
    await refreshAll();
    showToast(`Document ${created.title} uploaded successfully.`, 'success', 'Document Attached');
    return created;
  };

  const deleteDocument = async (id) => {
    setCustomDocuments(prev => prev.filter(d => d.id !== id));
    const success = await documentService.deleteDocument(id, currentUser?.name || "Documentation Staff");
    if (success) {
      fetchMenuApi('documents');
      await refreshAll();
      showToast(`Document ${id} removed.`, 'info', 'Document Deleted');
    }
    return success;
  };

  // 14. Ports & Island Destinations CRUD
  const createPort = async (portData) => {
    const created = await portService.createPort(portData, currentUser?.name || "Super Admin");
    fetchMenuApi('ports');
    await refreshAll();
    showToast(`Island Port Destination ${created.code} (${created.name}) registered.`, 'success', 'Port Added');
    return created;
  };

  const updatePort = async (id, updates) => {
    const updated = await portService.updatePort(id, updates, currentUser?.name || "Super Admin");
    fetchMenuApi('ports');
    await refreshAll();
    showToast(`Island Port ${id} updated successfully.`, 'success', 'Port Updated');
    return updated;
  };

  const deletePort = async (id) => {
    setPorts(prev => prev.filter(p => p.id !== id && p.code !== id));
    const success = await portService.deletePort(id, currentUser?.name || "Super Admin");
    if (success) {
      fetchMenuApi('ports');
      await refreshAll();
      showToast(`Island Port ${id} removed.`, 'info', 'Port Deleted');
    }
    return success;
  };

  // Clear all transactional records
  const clearAllData = async () => {
    clearTransactionalData();
    await settingsService.cleanSlate();
    refreshAll();
    showToast(`All transactional records cleared! System is now a clean blank slate for testing.`, 'success', 'Data Cleared');
  };

  const updateSettings = async (newSettings) => {
    setStored(KEYS.SETTINGS, newSettings);
    setSettings(newSettings);
    await settingsService.updateAllSettings(newSettings);
    refreshAll();
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
      fetchMenuApi,
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
      isBackendConnected,
      activeMenuTab,
      setActiveMenuTab,
      fetchMenuApi
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
