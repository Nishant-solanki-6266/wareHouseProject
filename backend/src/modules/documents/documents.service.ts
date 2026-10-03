import { DocumentsRepository, documentsRepository } from './documents.repository.js';
import { DocumentFilterParams } from './documents.types.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';

export class DocumentsService {
  constructor(private readonly repo: DocumentsRepository = documentsRepository) {}

  async listDocuments(filters: DocumentFilterParams) {
    return this.repo.findMany(filters);
  }

  async getDocument(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundError('Document');
    return item;
  }

  async createDocument(data: Record<string, unknown>) {
    const docNumber = (data.documentNumber as string) || `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    return this.repo.create({
      documentNumber: docNumber,
      entityType: (data.entityType as string) || 'CUSTOM_DOC',
      entityId: (data.entityId as string) || docNumber,
      documentType: (data.documentType as string) || 'CUSTOMS_DOC',
      fileName: (data.fileName as string) || 'document.pdf',
      fileUrl: (data.fileUrl as string) || null,
      mimeType: (data.mimeType as string) || 'application/pdf',
      fileSize: Number(data.fileSize) || 1024,
      status: (data.status as string) || 'Active',
      metadata: (data.metadata as Record<string, unknown>) || {},
      createdBy: (data.createdBy as string) || 'Documentation Staff',
    });
  }

  async updateDocument(id: string, data: Record<string, unknown>) {
    await this.getDocument(id);
    return this.repo.update(id, data);
  }

  async deleteDocument(id: string) {
    await this.getDocument(id);
    return this.repo.delete(id);
  }
}

export const documentsService = new DocumentsService();
