import { db } from '../db.js';
import { subTasks } from '../../src/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { ActivityLogService } from '../services/activityLogService.js';

const logService = new ActivityLogService();

export class SubTaskService {
  async createSubTask(actorId: number, data: any) {
    const [subTask] = await db.insert(subTasks).values(data).returning();
    await logService.createLog(actorId, 'subTask', subTask.id, 'CREATED', data);
    return subTask;
  }

  async updateSubTask(actorId: number, id: number, data: any) {
    const [existing] = await db.select().from(subTasks).where(eq(subTasks.id, id));
    if (!existing) throw new Error('Subtask not found');

    const [subTask] = await db.update(subTasks).set(data).where(eq(subTasks.id, id)).returning();
    
    const changes: any = {};
    for (const key of Object.keys(data)) {
      if (existing[key as keyof typeof existing] !== data[key]) {
        changes[key] = [existing[key as keyof typeof existing], data[key]];
      }
    }
    
    await logService.createLog(actorId, 'subTask', id, 'UPDATED', changes);
    return subTask;
  }

  async deleteSubTask(actorId: number, id: number) {
    await db.delete(subTasks).where(eq(subTasks.id, id));
    await logService.createLog(actorId, 'subTask', id, 'DELETED');
  }
}
