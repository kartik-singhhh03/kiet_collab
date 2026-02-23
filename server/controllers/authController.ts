import { Request, Response } from 'express';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const KIET_EMAIL_DOMAIN = '@kiet.edu';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strip sensitive / internal fields before sending to client */
function sanitiseUser(user: any) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.__v;
  return obj;
}

/** Validate password strength (min 6 chars) */
function validatePassword(password: string): string | null {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
/**
 * Register a new KIET Collab user.
 * Body: { name, email, password, gender?, branch?, passout_year?, skills?, interests?, role? }
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const {
    name, email, password,
    gender, branch, passout_year,
    skills, interests,
    department,
    role,
  } = req.body ?? {};

  // ── Required fields ────────────────────────────────────────────────────────
  if (!name || !email || !password) {
    return sendError(res, 'name, email, and password are required');
  }

  // ── KIET email gate ────────────────────────────────────────────────────────
  const normalizedEmail = String(email).toLowerCase().trim();
  if (!normalizedEmail.endsWith(KIET_EMAIL_DOMAIN)) {
    return sendError(res, `Only ${KIET_EMAIL_DOMAIN} email addresses are allowed`);
  }

  // ── Password strength ──────────────────────────────────────────────────────
  const pwError = validatePassword(String(password));
  if (pwError) return sendError(res, pwError);

  // ── Passout year validation ────────────────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const parsedPassoutYear = passout_year ? parseInt(String(passout_year), 10) : currentYear + 1;
  if (
    isNaN(parsedPassoutYear) ||
    parsedPassoutYear < currentYear - 10 ||
    parsedPassoutYear > currentYear + 10
  ) {
    return sendError(
      res,
      `passout_year must be a valid year (e.g. ${
        currentYear + 1
      } for a student graduating next year)`
    );
  }

  // ── Duplicate check ────────────────────────────────────────────────────────
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return sendError(res, 'An account with this email already exists', 409);
  }

  // ── Create user ────────────────────────────────────────────────────────────
  // Admin / judge roles cannot be self-assigned
  const safeRole = (['student', 'faculty'] as const).includes(role) ? role : 'student';

  const user = await User.create({
    name:       String(name).trim(),
    email:      normalizedEmail,
    password,
    gender:       gender     ?? 'prefer_not_to_say',
    branch:       branch     ?? '',
    passout_year: parsedPassoutYear,
    department:   department ?? '',
    skills:     Array.isArray(skills)    ? skills    : [],
    interests:  Array.isArray(interests) ? interests : [],
    role:       safeRole,
  });

  const token = signToken(String(user._id));
  sendSuccess(
    res,
    { message: 'Account created successfully', token, user: sanitiseUser(user) },
    201
  );
});

// ── Keep /register as an alias so existing integrations don't break ───────────
export const register = signup;

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
/**
 * Authenticate an existing user.
 * Body: { email, password }
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return sendError(res, 'email and password are required');
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // select: false on password — must explicitly request it
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    // Same error message regardless of whether email exists (prevents enumeration)
    return sendError(res, 'Invalid email or password', 401);
  }

  const match = await user.comparePassword(String(password));
  if (!match) {
    return sendError(res, 'Invalid email or password', 401);
  }

  // Bump lastActive
  user.lastActive = new Date();
  await user.save({ validateModifiedOnly: true });

  const token = signToken(String(user._id));
  sendSuccess(res, { token, user: sanitiseUser(user) });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
/** Stateless JWT — client simply discards the token. */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'Logged out successfully' });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
/** Return the currently authenticated user's profile. */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, { user: req.user });
});
