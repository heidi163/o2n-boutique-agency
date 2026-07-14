import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import { apiResponse } from '../middlewares/errorHandler.js';

const userService = new UserService();

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.listUsers();
    // omit passwords
    const safeUsers = users.map(u => {
      const { passwordHash, ...rest } = u;
      return rest;
    });
    res.json(apiResponse(safeUsers));
  } catch (err) { next(err); }
};
