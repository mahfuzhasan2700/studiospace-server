import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next(err);
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields ? { fields: err.fields } : {})
      }
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.');
      fields[path || 'body'] = issue.message;
    }
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        fields
      }
    });
    return;
  }

  // Unhandled internal errors
  const isProd = process.env.NODE_ENV === 'production';
  console.error('[UNHANDLED_ERROR]:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProd ? 'An unexpected error occurred. Please try again later.' : (err instanceof Error ? err.message : 'Unknown internal error')
    }
  });
}

