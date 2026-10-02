import { FastifyRequest, FastifyReply } from 'fastify';
import { ManifestsService, manifestsService } from './manifests.service.js';
import { manifestQuerySchema } from './manifests.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

export class ManifestsController {
  constructor(private readonly service: ManifestsService = manifestsService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = manifestQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listManifests({
      search: query.search,
      status: query.status,
      limit,
      offset,
    });

    const meta = buildPaginationMeta(total, page, limit);
    reply.send(paginatedResponse(data, meta));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const item = await this.service.getManifest(id);
    reply.send(successResponse(item));
  };

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = request.body as any;

    const newManifestData = {
      manifestNumber: body.manifestNumber || `MNF-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: body.type || 'Ocean Cargo Inward / Outward Manifest',
      title: body.title || `Customs Cargo Manifest - ${body.vesselName || 'M/V Ocean Star'} (Voyage ${body.voyageNumber || 'VOY-01'})`,
      vesselName: body.vesselName || 'M/V Ocean Star',
      voyageNumber: body.voyageNumber || 'VOY-2026-01',
      flag: body.flag || 'Bahamas',
      masterName: body.masterName || 'Capt. J. Cartwright',
      portOfLoading: body.portOfLoading || 'Port of Miami (USMIA)',
      portOfDischarge: body.portOfDischarge || 'NAS - Nassau Container Port',
      departureDate: body.departureDate || new Date().toISOString().split('T')[0],
      arrivalDate: body.arrivalDate || new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      carrier: body.carrier || 'Tropical Shipping',
      totalBLs: Number(body.totalBLs || body.totalBls) || 1,
      totalHouseBills: Number(body.totalHouseBills) || 0,
      totalContainers: Number(body.totalContainers) || 1,
      totalPackages: Number(body.totalPackages) || 0,
      totalPieces: Number(body.totalPieces || body.totalPackages) || 0,
      totalWeightLbs: String(body.totalWeightLbs || '0.00'),
      totalWeightKg: String(body.totalWeightKg || '0.00'),
      totalCbm: String(body.totalCbm || '0.00'),
      totalCft: String(body.totalCft || '0.00'),
      status: body.status || 'Generated',
      masterBLNumber: body.masterBLNumber || body.masterBlNumber || null,
      lineItems: body.lineItems || []
    };

    const item = await this.service.createManifest(newManifestData);
    reply.status(201).send(successResponse(item, 'Shipping Manifest created successfully'));
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const item = await this.service.updateManifest(id, body);
    reply.send(successResponse(item, 'Shipping Manifest updated successfully'));
  };

  delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const result = await this.service.deleteManifest(id);
    reply.send(successResponse(result, 'Shipping Manifest deleted successfully'));
  };
}

export const manifestsController = new ManifestsController();
