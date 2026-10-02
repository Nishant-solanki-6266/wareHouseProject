import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse } from '../../common/utils/response.js';
import { db } from '../../db/index.js';
import { warehouseReceipts, cargo, consolidations, shipments, billsOfLading, manifests, users, auditLogs, settings } from '../../db/schema/index.js';

export class MenusController {
  // STAGE 1: CFS Dashboard
  getCfsDashboard = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const allWRs = await db.select().from(warehouseReceipts);
      const totalReceipts = allWRs.length;
      const stagedItems = allWRs.filter(w => w.status === 'Ready for Consolidation' || w.status === 'STAGED');
      
      let totalCft = 0;
      let totalCbm = 0;
      allWRs.forEach(w => {
        totalCft += Number(w.totalCft || 0);
        totalCbm += Number(w.totalCbm || 0);
      });

      const bayOccupancy = [
        { bay: 'Bay A-01', rack: 'Rack 1', status: 'Occupied', itemsCount: 4, locationCode: 'A-01-R1' },
        { bay: 'Bay A-02', rack: 'Rack 3', status: 'Occupied', itemsCount: 2, locationCode: 'A-02-R3' },
        { bay: 'Bay B-05', rack: 'Rack 2', status: 'Occupied', itemsCount: 3, locationCode: 'B-05-R2' },
        { bay: 'Bay C-01', rack: 'Rack 4', status: 'Available', itemsCount: 0, locationCode: 'C-01-R4' }
      ];

      reply.send(successResponse({
        stageName: 'Stage 1: Cargo Receiving',
        assignedUser: 'Carlos Mendez (Miami CFS Warehouse)',
        menuName: 'CFS Dashboard',
        metrics: {
          totalWarehouseReceipts: totalReceipts,
          stagedCargoCount: stagedItems.length,
          totalVolumeCft: Number(totalCft.toFixed(2)),
          totalVolumeCbm: Number(totalCbm.toFixed(2)),
          activeStagingBays: 3,
        },
        bayOccupancy,
        recentReceipts: allWRs.slice(0, 5)
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 1 & 2: Cargo Inventory
  getCargoInventory = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const items = await db.select().from(cargo);
      reply.send(successResponse({
        stageName: 'Cargo Inventory',
        menuName: 'Cargo Inventory',
        count: items.length,
        items
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 1: Thermal 4x6 Barcode Cargo Labels
  getLabels = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const { id } = request.params as { id?: string };
      const allWRs = await db.select().from(warehouseReceipts);
      const targetWR = id ? allWRs.find(w => w.id === id || w.receiptNumber === id) : allWRs[0];

      const labelData = {
        labelFormat: '4x6 Standard Thermal Barcode Cargo Label (Code 128)',
        receiptNumber: targetWR?.receiptNumber || 'WR-2026-1041',
        barcodeFormat: 'Code 128',
        barcodeValue: targetWR?.barcode || 'WR994821034',
        shipper: targetWR?.shipper || 'Global Retail Suppliers Inc, Miami, FL',
        consignee: targetWR?.consignee || 'Atlantic Trading Co, Nassau, Bahamas',
        destinationPort: targetWR?.destinationPort || 'NAS - Nassau, Bahamas',
        dimensions: {
          lengthInches: targetWR?.lengthInches || '42',
          widthInches: targetWR?.widthInches || '38',
          heightInches: targetWR?.heightInches || '48',
        },
        weightLbs: targetWR?.weightLbs || '1200',
        weightKg: targetWR?.weightKg || '544.3',
        cft: targetWR?.totalCft || '44.33',
        cbm: targetWR?.totalCbm || '1.26',
        stagingLocation: targetWR?.warehouseLocation || 'Bay A-02, Rack 3',
        status: targetWR?.status || 'STAGED',
        printAlert: 'Ready for Operations Consolidation'
      };

      reply.send(successResponse(labelData));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 2: Operations Dashboard
  getOpsDashboard = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const allConsolidations = await db.select().from(consolidations);
      const allShipments = await db.select().from(shipments);
      const stagedReceipts = await db.select().from(warehouseReceipts);

      const awaitingConsolidation = stagedReceipts.filter(r => r.status === 'Ready for Consolidation' || r.status === 'STAGED');

      reply.send(successResponse({
        stageName: 'Stage 2: Container Consolidation',
        assignedUser: 'Elena Rostova (Vessel Operations)',
        menuName: 'Operations Dashboard',
        actionableTaskCard: {
          title: '5 Cargo Items Awaiting Consolidation',
          description: 'Filter staged Warehouse Receipts by destination port (Nassau) to build new container run.',
          count: awaitingConsolidation.length || 5,
          primaryCTA: '+ Build Consolidation'
        },
        metrics: {
          awaitingConsolidationCount: awaitingConsolidation.length || 5,
          totalConsolidations: allConsolidations.length,
          activeShipmentsCount: allShipments.length,
          averageFillPercentage: '85%'
        },
        activeContainerFill: [
          { containerNumber: 'MEDU7748219', type: '40ft High Cube', fillPercentage: 85, sealNumber: 'SEAL-2026-9941' },
          { containerNumber: 'TCLU9984120', type: '20ft Standard', fillPercentage: 92, sealNumber: 'SEAL-2026-9942' }
        ]
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 2: Containers & Vessels
  getContainersVessels = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      reply.send(successResponse({
        stageName: 'Containers & Vessels',
        menuName: 'Containers & Vessels',
        containerTypes: ['20ft Standard', '40ft Standard', '40ft High Cube'],
        containers: [
          { containerNumber: 'MEDU7748219', type: '40ft High Cube', carrier: 'Tropical Shipping', maxVolumeCbm: 76.2, tareWeightKg: 3900, status: 'Active In Consolidation' },
          { containerNumber: 'TCLU9984120', type: '20ft Standard', carrier: 'MSC Mediterranean', maxVolumeCbm: 33.2, tareWeightKg: 2200, status: 'Available at Yard' }
        ],
        vessels: [
          { name: 'M/V Tropic Sun', imoNumber: 'IMO-9842103', carrier: 'Tropical Shipping', activeRoute: 'Miami → Nassau' },
          { name: 'M/V Caribbean Explorer', imoNumber: 'IMO-9481029', carrier: 'Kingston Freight', activeRoute: 'Miami → Kingston' }
        ]
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 3: Documentation Desk Dashboard
  getDocsDashboard = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const blList = await db.select().from(billsOfLading);
      const manifestList = await db.select().from(manifests);

      const activeHolds = blList.filter(b => b.status === 'On Hold' || (b.holdDetails && b.holdDetails.isOnHold));
      const releasedBLs = blList.filter(b => b.status === 'Released' || b.status === 'RELEASED');

      reply.send(successResponse({
        stageName: 'Stage 3: Documentation & Customs Clearance',
        assignedUser: 'Sarah Jenkins (Documentation Specialist)',
        menuName: 'Documentation Desk',
        metrics: {
          totalMasterBLs: blList.length,
          activeHoldLocks: activeHolds.length,
          releasedBLsCount: releasedBLs.length,
          totalManifestsGenerated: manifestList.length
        },
        primaryCTAs: ['Review B/L', '+ Create Manifest'],
        categorySwitcher: ['Master Bills of Lading (MBL)', 'House Bills of Lading (HBL)']
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 3: Shipping Manifests
  getShippingManifests = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const list = await db.select().from(manifests);
      reply.send(successResponse({
        stageName: 'Shipping Manifests',
        menuName: 'Shipping Manifests',
        total: list.length,
        exportFormats: ['CSV', 'XML'],
        manifests: list
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 3: Documents Archive
  getDocumentsArchive = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      reply.send(successResponse({
        stageName: 'Documents Archive',
        menuName: 'Documents Archive',
        documentTypes: ['Commercial Invoice', 'Packing List', 'Customs Entry', 'Bill of Lading PDF', 'Delivery Order'],
        documents: [
          { docNumber: 'DOC-2026-101', docType: 'Commercial Invoice', title: 'Nassau Commercial Freight Invoice', status: 'Verified' },
          { docNumber: 'DOC-2026-102', docType: 'Bill of Lading PDF', title: 'MBL BL-VI-2026-0092 Certified Copy', status: 'RELEASED' }
        ]
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 4: Agent Dashboard
  getAgentDashboard = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      reply.send(successResponse({
        stageName: 'Stage 4: Destination Port Reception & Delivery',
        assignedUser: 'David Cartwright (Destination Agent)',
        portal: 'Restricted Destination Port Portal (Nassau Container Port)',
        menuName: 'Agent Dashboard',
        hiddenMenus: ['Internal Warehouse Bays', 'Pricing Settings', 'HQ Administration'],
        accessibleMenus: ['Agent Dashboard', 'My Assigned Shipments', 'Documents & B/Ls', 'Tracking'],
        metrics: {
          inboundVesselsCount: 2,
          assignedShipmentsCount: 4,
          releasedMasterBLsCount: 3,
          pendingDeliveryOrders: 1
        },
        primaryCTAs: ['Inspect Shipment', 'Download Delivery Documents']
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 4: Assigned Shipments
  getAssignedShipments = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const allShipments = await db.select().from(shipments);
      reply.send(successResponse({
        stageName: 'My Assigned Shipments',
        menuName: 'My Assigned Shipments',
        destinationPort: 'Nassau Container Port (BSNAS)',
        shipments: allShipments
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 4: Agent Documents & B/Ls
  getAgentDocuments = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      reply.send(successResponse({
        stageName: 'Agent Documents & B/Ls',
        menuName: 'Documents & B/Ls',
        availableDownloads: [
          { type: 'Master Bill of Lading (MBL)', blNumber: 'BL-VI-2026-0092', holdStatus: 'RELEASED', downloadUrl: '/api/v1/documents/MBL-0092.pdf' },
          { type: 'Outward Customs Manifest', manifestNumber: 'MNF-2026-044', format: 'CSV/XML', downloadUrl: '/api/v1/manifests/MNF-2026-044/export?format=xml' }
        ]
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 5: Admin Dashboard
  getAdminDashboard = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const allUsers = await db.select().from(users);
      const logs = await db.select().from(auditLogs);

      reply.send(successResponse({
        stageName: 'Stage 5: System Administration & Governance',
        assignedUser: 'Marcus Vance (Administrator)',
        menuName: 'Admin Dashboard',
        accessibleMenus: ['Admin Dashboard', 'Users & Roles', 'Audit Trail Logs', 'Shipment History', 'Settings'],
        metrics: {
          totalUsersCount: allUsers.length,
          immutableAuditLogsCount: logs.length,
          activeRolePermissions: ['warehouse', 'operations', 'documentation', 'agent', 'super_admin'],
          systemStatus: 'Operational'
        },
        supervisorOverrides: {
          totalAuthorized: 2,
          notes: 'Supervisor level hold release overrides authorized by Marcus Vance'
        }
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 5: Users & Roles
  getUsersRoles = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const list = await db.select().from(users);
      reply.send(successResponse({
        stageName: 'Users & Roles',
        menuName: 'Users & Roles',
        roles: ['super_admin', 'operations', 'documentation', 'agent', 'warehouse'],
        usersCount: list.length,
        users: list
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 5: Audit Trail Logs
  getAuditTrail = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const logs = await db.select().from(auditLogs);
      reply.send(successResponse({
        stageName: 'Audit Trail Logs',
        menuName: 'Audit Trail Logs',
        immutabilityNotice: 'Immutable system audit log tracking every login, receipt created, hold placed/cleared, and manifest exported.',
        totalEvents: logs.length,
        logs
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };

  // STAGE 5: Shipment History
  getShipmentHistory = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const history = await db.select().from(shipments);
      reply.send(successResponse({
        stageName: 'Shipment History',
        menuName: 'Shipment History',
        archivedCount: history.length,
        history
      }));
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message });
    }
  };
}

export const menusController = new MenusController();
