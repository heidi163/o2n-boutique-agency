import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.issues,
      },
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};

export const apiResponse = <T>(data: T, meta?: any) => {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public code: string = 'BAD_REQUEST') {
    super(message);
    this.name = 'ApiError';
  }
}
