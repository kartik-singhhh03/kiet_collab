import { Request, Response } from 'express';
import Project from '../models/Project.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { extractPublicId, deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

/** GET /api/projects */
export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 12);
  const skip  = (page - 1) * limit;

  const filter: Record<string, unknown> = { status: 'approved' };
  if (req.query.eventId) filter.eventId = req.query.eventId;
  if (req.query.tech)    filter.techStack = { $in: (req.query.tech as string).split(',') };

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('ownerId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(filter),
  ]);

  sendSuccess(res, { data: projects, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

/** GET /api/projects/:id */
export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('ownerId', 'name email avatar').lean();

  if (!project) return sendError(res, 'Project not found', 404);
  sendSuccess(res, { data: project });
});

/** POST /api/projects */
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, techStack, repoUrl, demoUrl, eventId } = req.body ?? {};
  if (!title) return sendError(res, 'title is required');

  const coverImage = (req as any).file?.path ?? '';

  const project = await Project.create({
    title,
    description,
    techStack: Array.isArray(techStack) ? techStack : (techStack ?? '').split(',').map((s: string) => s.trim()).filter(Boolean),
    repoUrl,
    demoUrl,
    coverImage,
    ownerId: req.user!._id,
    eventId: eventId ?? null,
    status: 'draft',
  });

  sendSuccess(res, { data: project }, 201);
});

/** PATCH /api/projects/:id */
export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) return sendError(res, 'Project not found', 404);

  const isOwner = String(project.ownerId) === String(req.user!._id);
  const isAdmin = req.user!.role === 'admin';
  if (!isOwner && !isAdmin) return sendError(res, 'Forbidden', 403);

  const allowed = ['title', 'description', 'techStack', 'repoUrl', 'demoUrl', 'status'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) (project as any)[key] = req.body[key];
  }

  if ((req as any).file?.path) {
    if (project.coverImage) await deleteFromCloudinary(extractPublicId(project.coverImage));
    project.coverImage = (req as any).file.path;
  }

  await project.save();
  sendSuccess(res, { data: project });
});

/** DELETE /api/projects/:id */
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) return sendError(res, 'Project not found', 404);

  const isOwner = String(project.ownerId) === String(req.user!._id);
  if (!isOwner && req.user!.role !== 'admin') return sendError(res, 'Forbidden', 403);

  if (project.coverImage) await deleteFromCloudinary(extractPublicId(project.coverImage));
  await project.deleteOne();
  sendSuccess(res, { message: 'Project deleted' });
});

/** POST /api/projects/:id/like */
export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) return sendError(res, 'Project not found', 404);

  const uid  = req.user!._id as any;
  const idx  = project.likes.findIndex((id) => String(id) === String(uid));
  if (idx === -1) {
    project.likes.push(uid);
  } else {
    project.likes.splice(idx, 1);
  }
  await project.save();
  sendSuccess(res, { liked: idx === -1, likes: project.likes.length });
});
