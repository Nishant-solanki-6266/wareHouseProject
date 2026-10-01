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
}

export const documentsService = new DocumentsService();
