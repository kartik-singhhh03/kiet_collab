import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.js';

/**
 * Restrict a route to one or more roles.
 * Must be used after the `protect` middleware.
 *
 * Usage: router.delete('/:id', protect, roleGuard('admin'), handler)
 */
export function roleGuard(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };
}

// ─── Convenience named guards ─────────────────────────────────────────────────

/** Allow only students */
export const studentOnly = roleGuard('student');

/** Allow students and faculty */
export const facultyOnly = roleGuard('faculty');

/** Allow judges (and admins by convention — chain with roleGuard('judge','admin') if needed) */
export const judgeOnly = roleGuard('judge');

/** Allow admins only */
export const adminOnly = roleGuard('admin');

/** Allow judges and admins */
export const judgeOrAdmin = roleGuard('judge', 'admin');

/** Allow faculty and admins */
export const facultyOrAdmin = roleGuard('faculty', 'admin');
