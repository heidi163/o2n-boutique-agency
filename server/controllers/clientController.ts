import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ClientService } from '../services/clientService.js';
import { apiResponse } from '../middlewares/errorHandler.js';

const clientService = new ClientService();

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = clientSchema.parse(req.body);
    const client = await clientService.createClient(req.user!.id, data);
    res.status(201).json(apiResponse(client));
  } catch (err) { next(err); }
};

export const getClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await clientService.getClient(parseInt(req.params.id));
    res.json(apiResponse(client));
  } catch (err) { next(err); }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = clientSchema.partial().parse(req.body);
    const client = await clientService.updateClient(req.user!.id, parseInt(req.params.id), data);
    res.json(apiResponse(client));
  } catch (err) { next(err); }
};

export const deleteClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clientService.deleteClient(req.user!.id, parseInt(req.params.id));
    res.json(apiResponse({ success: true }));
  } catch (err) { next(err); }
};

export const listClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page, limit } = req.query;
    const clients = await clientService.listClients(
      search as string,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 50
    );
    res.json(apiResponse(clients));
  } catch (err) { next(err); }
};
