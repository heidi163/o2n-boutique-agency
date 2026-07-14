import { ActivityLogRepository } from '../repositories/activityLogRepository.js';
import { getIo } from '../sockets/index.js';

const logRepo = new ActivityLogRepository();

export class ActivityLogService {
  async createLog(actorId: number, entityType: string, entityId: number, action: string, changes?: any) {
    const log = await logRepo.createLog({
      changedBy: actorId,
      entityType,
      entityId,
      action,
      changes,
    });

    const io = getIo();
    if (io) {
      io.emit('activity_log', log);
    }
    
    return log;
  }

  async getLogs(filters: any, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    return logRepo.getLogs(filters, limit, offset);
  }
}
