import { Request, Response } from 'express';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { extractPublicId, deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

/** GET /api/users  (admin only — list paginated users) */
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().select('-password -__v').skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ]);

  sendSuccess(res, { data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

/** GET /api/users/search?skills=react,node&availability=available */
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const skillsParam = String(req.query.skills ?? '').trim();
  if (!skillsParam) return sendError(res, 'skills query param is required (comma-separated)');

  const requestedSkills = skillsParam
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const query: Record<string, unknown> = {
    skills: { $in: requestedSkills },
  };
  if (req.query.availability) query.availability_status = req.query.availability;
  if (req.query.branch)       query.branch = req.query.branch;
  if (req.query.year)         query.year = Number(req.query.year);
  if (req.query.department)   query.department = req.query.department;

  const users = await User.find(query).select('-password -__v').lean();

  const results = users.map((u) => {
    const userSkills = u.skills.map((s: string) => s.toLowerCase());
    const matching = requestedSkills.filter((s) => userSkills.includes(s));
    return {
      ...u,
      matchScore: requestedSkills.length ? matching.length / requestedSkills.length : 0,
    };
  });

  results.sort((a, b) => b.matchScore - a.matchScore);
  sendSuccess(res, { data: results });
});

/** GET /api/users/:id */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password -__v').lean();
  if (!user) return sendError(res, 'User not found', 404);
  sendSuccess(res, { data: user });
});

/** PATCH /api/users/me  — update own profile */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const allowed = ['name', 'bio', 'department', 'branch', 'year', 'gender', 'skills', 'interests', 'availability_status'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  // If a new avatar was uploaded via multer+cloudinary
  if ((req as any).file?.path) {
    // Delete old avatar from Cloudinary
    if (req.user?.avatar) {
      await deleteFromCloudinary(extractPublicId(req.user.avatar));
    }
    updates.avatar = (req as any).file.path;
  }

  const user = await User.findByIdAndUpdate(req.user!._id, updates, {
    new: true,
    runValidators: true,
  }).select('-password -__v');

  sendSuccess(res, { data: user });
});

/** DELETE /api/users/:id  (admin only) */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return sendError(res, 'User not found', 404);
  sendSuccess(res, { message: 'User deleted' });
});
