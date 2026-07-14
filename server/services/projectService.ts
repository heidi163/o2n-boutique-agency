import { ProjectRepository } from '../repositories/projectRepository.js';
import { ActivityLogService } from './activityLogService.js';
import { ApiError } from '../middlewares/errorHandler.js';

const projectRepo = new ProjectRepository();
const logService = new ActivityLogService();

export class ProjectService {
  async createProject(actorId: number, data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    
    const project = await projectRepo.createProject({
      ...data,
      createdBy: actorId,
    });
    
    await logService.createLog(actorId, 'project', project.id, 'CREATED', data);
    return project;
  }

  async getProject(id: number) {
    const project = await projectRepo.getProjectById(id);
    if (!project) throw new ApiError(404, 'Project not found', 'PROJECT_NOT_FOUND');
    return project;
  }

  async updateProject(actorId: number, id: number, data: any) {
    const existing = await this.getProject(id);
    
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.dueDate) data.dueDate = new Date(data.dueDate);

    const project = await projectRepo.updateProject(id, data);
    
    const changes: any = {};
    for (const key of Object.keys(data)) {
      if (existing[key as keyof typeof existing] !== data[key]) {
        changes[key] = [existing[key as keyof typeof existing], data[key]];
      }
    }
    
    await logService.createLog(actorId, 'project', id, 'UPDATED', changes);
    return project;
  }

  async deleteProject(actorId: number, id: number) {
    await this.getProject(id);
    await projectRepo.deleteProject(id);
    await logService.createLog(actorId, 'project', id, 'DELETED');
  }

  async listProjects(filters: any, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    return projectRepo.listProjects(filters, limit, offset);
  }
}
