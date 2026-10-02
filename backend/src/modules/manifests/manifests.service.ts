import { ManifestsRepository, manifestsRepository } from './manifests.repository.js';
import { ManifestFilterParams, CreateManifestInput, UpdateManifestInput } from './manifests.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { convertLbsToKg } from '../../common/utils/calculations.js';

export class ManifestsService {
  constructor(private readonly repo: ManifestsRepository = manifestsRepository) {}

  async listManifests(filters: ManifestFilterParams) {
    return this.repo.findMany(filters);
  }

  async getManifest(idOrNumber: string) {
    const item = await this.repo.findByIdOrNumber(idOrNumber);
    if (!item) throw new NotFoundError('Shipping Manifest');
    return item;
  }

  async createManifest(input: CreateManifestInput) {
    const totalCount = await this.repo.countTotal();
    const seq = String(totalCount + 1).padStart(4, '0');
    const manifestNumber = input.manifestNumber && input.manifestNumber.trim()
      ? input.manifestNumber.trim()
      : `MNF-2026-${seq}`;

    const weightLbs = Number(input.totalWeightLbs) || 0;
    const weightKg = input.totalWeightKg ? Number(input.totalWeightKg) : convertLbsToKg(weightLbs);

    return this.repo.create({
      manifestNumber,
      type: input.type || 'Ocean Cargo Inward / Outward Manifest',
      title: input.title || `Ocean Cargo Manifest — ${input.vesselName || 'Vessel'} (${input.voyageNumber || 'Voyage'})`,
      vesselName: input.vesselName || 'M/V Caribbean Voyager',
      voyageNumber: input.voyageNumber || 'VOY-2026-088',
      flag: input.flag || 'Bahamas',
      masterName: input.masterName || 'Capt. Marcus Vance',
      portOfLoading: input.portOfLoading || 'Port of Miami, USA (USMIA)',
      portOfDischarge: input.portOfDischarge || 'Nassau Container Port (BSNAS)',
      departureDate: input.departureDate || new Date().toISOString().split('T')[0],
      arrivalDate: input.arrivalDate || null,
      carrier: input.carrier || 'Tropical Shipping',
      totalBLs: Number(input.totalBLs) || 1,
      totalHouseBills: Number(input.totalHouseBills) || 0,
      totalContainers: Number(input.totalContainers) || 1,
      totalPackages: Number(input.totalPackages) || 0,
      totalPieces: Number(input.totalPieces) || Number(input.totalPackages) || 0,
      totalWeightLbs: String(weightLbs.toFixed(2)),
      totalWeightKg: String(weightKg.toFixed(2)),
      totalCbm: String((Number(input.totalCbm) || 0).toFixed(2)),
      totalCft: String((Number(input.totalCft) || 0).toFixed(2)),
      status: input.status || 'Generated',
      masterBLNumber: input.masterBLNumber || input.masterBLId || null,
      lineItems: input.lineItems || [],
    });
  }

  async updateManifest(id: string, input: UpdateManifestInput) {
    await this.getManifest(id);

    const updatePayload: Record<string, unknown> = { ...input };
    if (input.totalWeightLbs !== undefined) {
      updatePayload.totalWeightLbs = String((Number(input.totalWeightLbs) || 0).toFixed(2));
    }
    if (input.totalWeightKg !== undefined) {
      updatePayload.totalWeightKg = String((Number(input.totalWeightKg) || 0).toFixed(2));
    }
    if (input.totalCbm !== undefined) {
      updatePayload.totalCbm = String((Number(input.totalCbm) || 0).toFixed(2));
    }
    if (input.totalCft !== undefined) {
      updatePayload.totalCft = String((Number(input.totalCft) || 0).toFixed(2));
    }

    return this.repo.update(id, updatePayload);
  }

  async deleteManifest(id: string) {
    await this.getManifest(id);
    return this.repo.delete(id);
  }
}

export const manifestsService = new ManifestsService();
