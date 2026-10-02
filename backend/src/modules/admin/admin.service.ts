import { AdminRepository, adminRepository } from './admin.repository.js';

export class AdminService {
  constructor(private readonly repo: AdminRepository = adminRepository) {}

  async getDashboard() {
    return this.repo.getDashboardMetrics();
  }
}

export const adminService = new AdminService();
