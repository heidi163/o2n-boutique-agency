import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SubTaskService } from '../services/subTaskService.js';
import { apiResponse } from '../middlewares/errorHandler.js';

const subTaskService = new SubTaskService();

const subTaskSchema = z.object({
  taskId: z.number().int().positive(),
  title: z.string().min(1),
  isCompleted: z.boolean().optional(),
  order: z.number().int().nonnegative(),
});

export const createSubTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = subTaskSchema.parse(req.body);
    const subTask = await subTaskService.createSubTask(req.user!.id, data);
    res.status(201).json(apiResponse(subTask));
  } catch (err) { next(err); }
};

export const updateSubTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = subTaskSchema.partial().parse(req.body);
    const subTask = await subTaskService.updateSubTask(req.user!.id, parseInt(req.params.id), data);
    res.json(apiResponse(subTask));
  } catch (err) { next(err); }
};

export const deleteSubTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await subTaskService.deleteSubTask(req.user!.id, parseInt(req.params.id));
    res.json(apiResponse({ success: true }));
  } catch (err) { next(err); }
};
