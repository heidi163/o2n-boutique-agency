import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ProjectService } from '../services/projectService.js';
import { apiResponse } from '../middlewares/errorHandler.js';

const projectService = new ProjectService();

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  clientId: z.number().int().positive(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = projectSchema.parse(req.body);
    const project = await projectService.createProject(req.user!.id, data);
    res.status(201).json(apiResponse(project));
  } catch (err) { next(err); }
};

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.getProject(parseInt(req.params.id));
    res.json(apiResponse(project));
  } catch (err) { next(err); }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = projectSchema.partial().parse(req.body);
    const project = await projectService.updateProject(req.user!.id, parseInt(req.params.id), data);
    res.json(apiResponse(project));
  } catch (err) { next(err); }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await projectService.deleteProject(req.user!.id, parseInt(req.params.id));
    res.json(apiResponse({ success: true }));
  } catch (err) { next(err); }
};

export const listProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, clientId, page, limit } = req.query;
    const projects = await projectService.listProjects(
      {
        search: search as string,
        status: status as string,
        clientId: clientId ? parseInt(clientId as string) : undefined
      },
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 50
    );
    res.json(apiResponse(projects));
  } catch (err) { next(err); }
};
