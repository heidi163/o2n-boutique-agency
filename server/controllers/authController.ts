import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService.js';
import { apiResponse, ApiError } from '../middlewares/errorHandler.js';

const userService = new UserService();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
  jobTitle: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await userService.listUsers();
    if (existing.some(u => u.email === data.email)) {
      throw new ApiError(400, 'User with this email already exists', 'EMAIL_IN_USE');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await userService.createUser({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'MEMBER',
      jobTitle: data.jobTitle,
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json(apiResponse({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token }));
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    
    const users = await userService.listUsers();
    const user = users.find(u => u.email === data.email);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    // Setting a fake refresh token cookie as requested by the user
    res.cookie('refresh_token', 'dummy_refresh_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    res.json(apiResponse({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token }));
  } catch (err) { next(err); }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    res.json(apiResponse(user));
  } catch (err) { next(err); }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('refresh_token');
  res.json(apiResponse({ success: true }));
};
