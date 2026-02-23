import { Response } from 'express';

interface SuccessPayload<T = unknown> {
  message?: string;
  data?: T;
  [key: string]: unknown;
}

/** Send a standardised success envelope */
export function sendSuccess<T>(
  res: Response,
  payload: SuccessPayload<T>,
  statusCode = 200
): void {
  res.status(statusCode).json({ success: true, ...payload });
}

/** Send a standardised error envelope */
export function sendError(res: Response, message: string, statusCode = 400): void {
  res.status(statusCode).json({ success: false, message });
}
