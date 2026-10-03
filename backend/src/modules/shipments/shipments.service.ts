import { ShipmentsRepository, shipmentsRepository } from './shipments.repository.js';
import { ShipmentFilterParams, CreateShipmentInput, UpdateShipmentInput } from './shipments.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { convertLbsToKg } from '../../common/utils/calculations.js';
import { db } from '../../db/index.js';
import { trackingEvents } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export class ShipmentsService {
  constructor(private readonly repo: ShipmentsRepository = shipmentsRepository) {}

  async listShipments(filters: ShipmentFilterParams) {
    return this.repo.findMany(filters);
  }

  async getShipment(idOrNumber: string) {
    const item = await this.repo.findByIdOrNumber(idOrNumber);
    if (!item) throw new NotFoundError('Shipment');
    return item;
  }

  async createShipment(input: CreateShipmentInput) {
    const totalCount = await this.repo.countTotal();
    const seq = String(totalCount + 1).padStart(4, '0');
    const shipmentNumber = input.shipmentNumber && input.shipmentNumber.trim()
      ? input.shipmentNumber.trim()
      : `SHP-2026-${seq}`;

    const trackingNumber = input.trackingNumber && input.trackingNumber.trim()
      ? input.trackingNumber.trim()
      : `TRK-VI-${Math.floor(100000 + Math.random() * 900000)}`;

    const createdDate = input.createdDate || new Date().toISOString().split('T')[0];
    const destinationPort = input.destinationPort || 'NAS - Nassau Container Port';
    const destination = input.destination || destinationPort;
    const origin = input.origin || 'Port of Miami (USMIA)';

    const validAgentId = input.agentId && UUID_REGEX.test(input.agentId) ? input.agentId : null;

    const totalWeightLbsNum = Number(input.totalWeightLbs) || 0;
    const totalWeightKgNum = input.totalWeightKg ? Number(input.totalWeightKg) : convertLbsToKg(totalWeightLbsNum);

    const defaultStages = [
      { stage: 'Cargo Received CFS Miami', status: 'Completed', location: origin, notes: 'Cargo received and staged at CFS' },
      { stage: 'Container Stuffed & Sealed', status: 'Pending', location: 'CFS Miami Staging Yard', notes: 'Container packing and bolt seal assigned' },
      { stage: 'Loaded Onboard Vessel', status: 'Pending', location: origin, notes: `Loaded onboard vessel` },
      { stage: 'Vessel Departed Origin', status: 'Pending', location: origin, notes: `Departed origin en route to ${destinationPort}` },
      { stage: 'Vessel Arrived at Destination', status: 'Pending', location: destinationPort, notes: `Vessel docked at ${destinationPort}` },
      { stage: 'Customs Cleared & Handed Over', status: 'Pending', location: destinationPort, notes: 'Customs clearance and cargo delivery' },
    ];

    const checkpoints = (input.trackingCheckpoints && input.trackingCheckpoints.length > 0)
      ? input.trackingCheckpoints
      : defaultStages.map((s, idx) => ({
          id: `chk-${Date.now()}-${idx + 1}`,
          stage: s.stage,
          status: (idx === 0 ? 'Completed' : 'Pending') as any,
          date: createdDate,
          time: '10:00 AM',
          location: s.location,
          notes: s.notes,
        }));

    const created = await this.repo.create({
      shipmentNumber,
      type: input.type || 'Ocean LCL Consolidation',
      serviceMode: input.serviceMode || 'Port-to-Port',
      status: input.status || 'Cargo Received',
      trackingNumber,
      origin,
      destination,
      destinationPort,
      destinationCode: input.destinationCode || 'NAS',
      agentId: validAgentId,
      agentName: input.agentName || null,
      vesselName: input.vesselName || null,
      voyageNumber: input.voyageNumber || null,
      carrier: input.carrier || 'Tropical Shipping',
      containerNumber: input.containerNumber || null,
      containerType: input.containerType || "40' Standard Dry",
      sealNumber: input.sealNumber || null,
      billOfLadingId: input.billOfLadingId || null,
      billOfLadingNumber: input.billOfLadingNumber || null,
      blStatus: input.blStatus || 'Draft',
      manifestNumber: input.manifestNumber || null,
      totalPackages: Number(input.totalPackages) || 0,
      totalWeightLbs: String(totalWeightLbsNum.toFixed(2)),
      totalWeightKg: String(totalWeightKgNum.toFixed(2)),
      totalCft: String((Number(input.totalCft) || 0).toFixed(2)),
      totalCbm: String((Number(input.totalCbm) || 0).toFixed(2)),
      etd: input.etd || createdDate,
      eta: input.eta || null,
      createdDate,
      warehouseReceiptIds: input.warehouseReceiptIds || [],
      consolidationId: input.consolidationId || null,
      currentLocation: input.currentLocation || origin,
      trackingCheckpoints: checkpoints,
    });

    // Also populate public.tracking_events table in PostgreSQL
    for (let i = 0; i < checkpoints.length; i++) {
      const chk = checkpoints[i];
      await db
        .insert(trackingEvents)
        .values({
          trackingNumber: created.trackingNumber,
          shipmentId: created.id,
          stage: chk.stage || `Stage ${i + 1}`,
          status: chk.status || (i === 0 ? 'Completed' : 'Pending'),
          eventDate: chk.date || createdDate,
          eventTime: chk.time || '10:00 AM',
          location: chk.location || origin,
          notes: chk.notes || '',
          checkpointIndex: i,
        })
        .catch((err: any) => console.warn('tracking_event insert notice:', err?.message));
    }

    return created;
  }

  async updateShipment(id: string, input: UpdateShipmentInput) {
    const existing = await this.getShipment(id);

    const updatePayload: Record<string, unknown> = { ...input };
    if (input.agentId !== undefined) {
      updatePayload.agentId = input.agentId && UUID_REGEX.test(input.agentId) ? input.agentId : null;
    }
    if (input.totalWeightLbs !== undefined) {
      updatePayload.totalWeightLbs = String((Number(input.totalWeightLbs) || 0).toFixed(2));
    }
    if (input.totalWeightKg !== undefined) {
      updatePayload.totalWeightKg = String((Number(input.totalWeightKg) || 0).toFixed(2));
    }
    if (input.totalCft !== undefined) {
      updatePayload.totalCft = String((Number(input.totalCft) || 0).toFixed(2));
    }
    if (input.totalCbm !== undefined) {
      updatePayload.totalCbm = String((Number(input.totalCbm) || 0).toFixed(2));
    }

    const updated = await this.repo.update(id, updatePayload);

    // Synchronize public.tracking_events table in PostgreSQL
    if (input.trackingCheckpoints && Array.isArray(input.trackingCheckpoints)) {
      await db.delete(trackingEvents).where(eq(trackingEvents.shipmentId, existing.id)).catch(() => {});
      for (let i = 0; i < input.trackingCheckpoints.length; i++) {
        const chk = input.trackingCheckpoints[i];
        await db
          .insert(trackingEvents)
          .values({
            trackingNumber: updated?.trackingNumber || existing.trackingNumber,
            shipmentId: existing.id,
            stage: chk.stage || `Stage ${i + 1}`,
            status: chk.status || 'Active',
            eventDate: chk.date || new Date().toISOString().split('T')[0],
            eventTime: chk.time || '10:00 AM',
            location: chk.location || existing.currentLocation || 'In Transit',
            notes: chk.notes || '',
            checkpointIndex: i,
          })
          .catch((err: any) => console.warn('tracking_event update notice:', err?.message));
      }
    } else if (input.status && input.status !== existing.status) {
      const existingEvents = await db
        .select()
        .from(trackingEvents)
        .where(eq(trackingEvents.shipmentId, existing.id));

      const match = existingEvents.find(e => e.stage.toLowerCase().includes(input.status!.toLowerCase()));
      if (match) {
        await db
          .update(trackingEvents)
          .set({ status: 'Completed', updatedAt: new Date() })
          .where(eq(trackingEvents.id, match.id))
          .catch(() => {});
      } else {
        await db
          .insert(trackingEvents)
          .values({
            trackingNumber: updated?.trackingNumber || existing.trackingNumber,
            shipmentId: existing.id,
            stage: input.status,
            status: 'Completed',
            eventDate: new Date().toISOString().split('T')[0],
            eventTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: (input.currentLocation as string) || existing.currentLocation || existing.destinationPort,
            notes: `Shipment status updated to ${input.status}`,
            checkpointIndex: existingEvents.length,
          })
          .catch(() => {});
      }
    }

    return updated;
  }

  async deleteShipment(id: string) {
    const existing = await this.getShipment(id);
    await db.delete(trackingEvents).where(eq(trackingEvents.shipmentId, existing.id)).catch(() => {});
    return this.repo.delete(id);
  }
}

export const shipmentsService = new ShipmentsService();
