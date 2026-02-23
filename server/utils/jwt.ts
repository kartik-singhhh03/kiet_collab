import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
}

export function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as string;
  return jwt.sign({ userId } as TokenPayload, secret, { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET!;
  return jwt.verify(token, secret) as TokenPayload;
}
