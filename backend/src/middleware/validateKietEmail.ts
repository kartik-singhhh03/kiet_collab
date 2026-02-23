/**
 * validateKietEmail middleware
 * ----------------------------
 * Runs parseKietEmail() on req.body.email and rejects the request early
 * if the email does not conform to the KIET institutional format.
 *
 * Attach BEFORE any route handler that creates or updates a user:
 *   router.post('/register', validateKietEmail, authRateLimiter, handler)
 */

import { Request, Response, NextFunction } from "express";
import { parseKietEmail } from "../utils/parseKietEmail";

export const validateKietEmail = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  try {
    // Validation only — the parsed result is consumed in the route handler
    parseKietEmail(email as string);
    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid KIET email.";
    res.status(400).json({ error: message });
  }
};
