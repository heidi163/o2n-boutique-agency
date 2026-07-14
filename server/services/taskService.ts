import { TaskRepository } from '../repositories/taskRepository.js';
import { ActivityLogService } from './activityLogService.js';
import { ApiError } from '../middlewares/errorHandler.js';

const taskRepo = new TaskRepository();
const logService = new ActivityLogService();

export class TaskService {
  async createTask(actorId: number, data: any) {
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    
    const task = await taskRepo.createTask({
      ...data,
      createdBy: actorId,
    });
    
    await logService.createLog(actorId, 'task', task.id, 'CREATED', data);
    return task;
  }

  async getTask(id: number) {
    const task = await taskRepo.getTaskById(id);
    if (!task) throw new ApiError(404, 'Task not found', 'TASK_NOT_FOUND');
    return task;
  }

  async updateTask(actorId: number, id: number, data: any) {
    const existing = await this.getTask(id);
    if (data.dueDate) data.dueDate = new Date(data.dueDate);

    const task = await taskRepo.updateTask(id, data);
    
    const changes: any = {};
    for (const key of Object.keys(data)) {
      if (existing[key as keyof typeof existing] !== data[key]) {
        changes[key] = [existing[key as keyof typeof existing], data[key]];
      }
    }
    
    await logService.createLog(actorId, 'task', id, 'UPDATED', changes);
    return task;
  }

  async deleteTask(actorId: number, id: number) {
    await this.getTask(id);
    await taskRepo.deleteTask(id);
    await logService.createLog(actorId, 'task', id, 'DELETED');
  }

  async listTasks(filters: any, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    return taskRepo.listTasks(filters, limit, offset);
  }
}
