import { ClientRepository } from '../repositories/clientRepository.js';
import { ActivityLogService } from './activityLogService.js';
import { ApiError } from '../middlewares/errorHandler.js';

const clientRepo = new ClientRepository();
const logService = new ActivityLogService();

export class ClientService {
  async createClient(actorId: number, data: any) {
    const client = await clientRepo.createClient({
      ...data,
      createdBy: actorId,
    });
    
    await logService.createLog(actorId, 'client', client.id, 'CREATED', data);
    return client;
  }

  async getClient(id: number) {
    const client = await clientRepo.getClientById(id);
    if (!client) throw new ApiError(404, 'Client not found', 'CLIENT_NOT_FOUND');
    return client;
  }

  async updateClient(actorId: number, id: number, data: any) {
    const existing = await this.getClient(id);
    
    const client = await clientRepo.updateClient(id, data);
    
    // Create diff
    const changes: any = {};
    for (const key of Object.keys(data)) {
      if (existing[key as keyof typeof existing] !== data[key]) {
        changes[key] = [existing[key as keyof typeof existing], data[key]];
      }
    }
    
    await logService.createLog(actorId, 'client', id, 'UPDATED', changes);
    return client;
  }

  async deleteClient(actorId: number, id: number) {
    await this.getClient(id);
    await clientRepo.deleteClient(id);
    await logService.createLog(actorId, 'client', id, 'DELETED');
  }

  async listClients(search?: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    return clientRepo.listClients(search, limit, offset);
  }
}
