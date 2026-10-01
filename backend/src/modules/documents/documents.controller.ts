import { FastifyRequest, FastifyReply } from 'fastify';
import { DocumentsService, documentsService } from './documents.service.js';
import { documentQuerySchema } from './documents.schema.js';
import { successResponse, paginatedResponse } from '../../common/utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../common/utils/pagination.js';

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
    reply.send(successResponse(item));
  };
}

export const documentsController = new DocumentsController();
