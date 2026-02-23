import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Central error-handling middleware.
 * Must be registered LAST in Express middleware chain.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message =
    err.isOperational || process.env.NODE_ENV !== 'production'
      ? err.message
      : 'Internal Server Error';

  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error('Unhandled error:', err);
  }

  res.status(statusCode).json({ success: false, message });
}

/** Factory for operational errors (safe to expose message to client) */
export function createError(message: string, statusCode = 400): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
}
