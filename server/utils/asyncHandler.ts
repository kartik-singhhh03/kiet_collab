import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler and forwards any thrown error to Express's
 * next() so the central errorHandler middleware can deal with it.
 *
 * Usage:
 *   router.get('/', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
