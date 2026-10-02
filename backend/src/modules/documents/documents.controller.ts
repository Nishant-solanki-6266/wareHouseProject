import { FastifyRequest, FastifyReply } from 'fastify';
import { DocumentsService, documentsService } from './documents.service.js';
import { documentQuerySchema } from './documents.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';
import { AppError } from '../../common/errors/app-error.js';
import { db } from '../../db/index.js';
import { billsOfLading } from '../../db/schema/index.js';
import { eq, or } from 'drizzle-orm';

export class DocumentsController {
  constructor(private readonly service: DocumentsService = documentsService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = documentQuerySchema.parse(request.query);
    const { page, limit, offset } = getPaginationParams(query);

    const { data, total } = await this.service.listDocuments({
      entityType: query.entityType,
      entityId: query.entityId,
      documentType: query.documentType,
      limit,
      offset,
    });

    const meta = buildPaginationMeta(total, page, limit);
    reply.send(paginatedResponse(data, meta));
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const item = await this.service.getDocument(id);

    // Hold Governance: Strict enforcement for destination agents
    const userRole = (request.user as any)?.roleKey || (request.user as any)?.role;
    if (userRole === 'agent' || userRole === 'destination_agent') {
      const isBlDoc =
        item.entityType?.toLowerCase().includes('bill_of_lading') ||
        item.documentType?.toLowerCase().includes('bill_of_lading') ||
        item.documentType?.toLowerCase().includes('mbl');

      if (isBlDoc) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.entityId);
        const condition = isUuid
          ? or(eq(billsOfLading.id, item.entityId), eq(billsOfLading.blNumber, item.entityId))
          : eq(billsOfLading.blNumber, item.entityId);

        const bl = await db
          .select()
          .from(billsOfLading)
          .where(condition)
          .limit(1);

        if (bl[0] && (bl[0].status === 'On Hold' || bl[0].holdDetails?.isOnHold)) {
          throw new AppError(
            'Document download restricted: Consignment is currently ON HOLD. Contact documentation staff to resolve hold.',
            403
          );
        }
      }
    }


    reply.send(successResponse(item));
  };
}

export const documentsController = new DocumentsController();

