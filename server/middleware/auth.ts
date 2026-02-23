import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';

/** Extend Express Request to carry the authenticated user */
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifies the Bearer JWT and attaches req.user.
 * Returns 401 on any auth failure.
 */
export async function protect(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}
