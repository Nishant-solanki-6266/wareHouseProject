import { FastifyRequest, FastifyReply } from 'fastify';
import { ShipmentsService, shipmentsService } from './shipments.service.js';
import { shipmentQuerySchema } from './shipments.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class ShipmentsController {
  constructor(private readonly service: ShipmentsService = shipmentsService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = shipmentQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listShipments({
      search: query.search,
      status: query.status,
      destinationCode: query.destinationCode,
      agentId: query.agentId,
      limit,
      offset,
    });

    const meta = buildPaginationMeta(total, page, limit);
    reply.send(paginatedResponse(data, meta));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const item = await this.service.getShipment(id);
    reply.send(successResponse(item));
  };

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = request.body as any;
    const user = request.user;

    const newShipmentData = {
      shipmentNumber: body.shipmentNumber || `SHP-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: body.type || 'Ocean LCL Consolidation',
      serviceMode: body.serviceMode || 'Port-to-Port',
      status: body.status || 'Cargo Received',
      trackingNumber: body.trackingNumber || `TRK-VI-${Math.floor(100000 + Math.random() * 900000)}`,
      origin: body.origin || 'Port of Miami (USMIA)',
      destination: body.destination || body.destinationPort || 'Nassau, Bahamas',
      destinationPort: body.destinationPort || 'NAS - Nassau Container Port',
      destinationCode: body.destinationCode || user?.destinationPortCode || 'NAS',
      agentId: user?.agentId || body.agentId || null,
      agentName: body.agentName || (user?.roleKey === 'agent' ? user.name : 'Caribbean Express Freight Ltd.'),
      vesselName: body.vesselName || 'Island Voyager',
      voyageNumber: body.voyageNumber || 'V.2026-14N',
      carrier: body.carrier || 'Tropical Shipping',
      containerNumber: body.containerNumber || '',
      containerType: body.containerType || "40' High Cube Dry",
      sealNumber: body.sealNumber || `SEAL-VI-${Math.floor(10000 + Math.random() * 90000)}`,
      totalPackages: Number(body.totalPackages) || 0,
      totalWeightLbs: String(body.totalWeightLbs || '0.00'),
      totalWeightKg: String(body.totalWeightKg || '0.00'),
      totalCft: String(body.totalCft || '0.00'),
      totalCbm: String(body.totalCbm || '0.00'),
      etd: body.etd || new Date().toISOString().split('T')[0],
      eta: body.eta || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      createdDate: body.createdDate || new Date().toISOString().split('T')[0],
      blStatus: body.blStatus || 'Draft',
      warehouseReceiptIds: body.warehouseReceiptIds || [],
      trackingCheckpoints: body.trackingCheckpoints || [
        {
          id: `chk-${Date.now()}-1`,
          stage: 'Cargo Received',
          status: 'Completed',
          date: new Date().toISOString().split('T')[0],
          time: '09:00 AM',
          location: body.origin || 'Miami CFS Warehouse',
          notes: 'Shipment registered in system.'
        }
      ]
    };

    const item = await this.service.createShipment(newShipmentData);
    reply.status(201).send(successResponse(item, 'Shipment created successfully'));
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const item = await this.service.updateShipment(id, body);
    reply.send(successResponse(item, 'Shipment updated successfully'));
  };

  delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const result = await this.service.deleteShipment(id);
    reply.send(successResponse(result, 'Shipment deleted successfully'));
  };
}

export const shipmentsController = new ShipmentsController();
