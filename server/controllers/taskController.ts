import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TaskService } from '../services/taskService.js';
import { apiResponse } from '../middlewares/errorHandler.js';

const taskService = new TaskService();

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  projectId: z.number().int().positive(),
  clientId: z.number().int().positive().optional().nullable(),
  assigneeId: z.number().int().positive().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
  dueDate: z.string().optional().nullable(),
  estimatedHours: z.number().int().nonnegative().optional().nullable(),
  actualHours: z.number().int().nonnegative().optional().nullable(),
});

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = taskSchema.parse(req.body);
    const task = await taskService.createTask(req.user!.id, data);
    res.status(201).json(apiResponse(task));
  } catch (err) { next(err); }
};

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.getTask(parseInt(req.params.id));
    res.json(apiResponse(task));
  } catch (err) { next(err); }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = taskSchema.partial().parse(req.body);
    const task = await taskService.updateTask(req.user!.id, parseInt(req.params.id), data);
    res.json(apiResponse(task));
  } catch (err) { next(err); }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await taskService.deleteTask(req.user!.id, parseInt(req.params.id));
    res.json(apiResponse({ success: true }));
  } catch (err) { next(err); }
};

export const listTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, assigneeId, status, priority, page, limit } = req.query;
    const tasks = await taskService.listTasks(
      {
        projectId: projectId ? parseInt(projectId as string) : undefined,
        assigneeId: assigneeId ? parseInt(assigneeId as string) : undefined,
        status: status as string,
        priority: priority as string,
      },
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 50
    );
    res.json(apiResponse(tasks));
  } catch (err) { next(err); }
};
