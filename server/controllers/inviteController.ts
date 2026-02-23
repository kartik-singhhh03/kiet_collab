import { Request, Response } from 'express';
import Invite from '../models/Invite.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getIO } from '../sockets/socketHandler.js';

/** POST /api/invites */
export const createInvite = asyncHandler(async (req: Request, res: Response) => {
  const { toUserId, eventId, message } = req.body ?? {};
  if (!toUserId) return sendError(res, 'toUserId is required');
  if (String(toUserId) === String(req.user!._id)) {
    return sendError(res, 'Cannot invite yourself');
  }

  const invite = await Invite.create({
    fromUserId: req.user!._id,
    toUserId,
    eventId: eventId ?? null,
    message: message ?? '',
    status: 'pending',
  });

  // Real-time notification
  const io = getIO();
  if (io) io.to(`user:${toUserId}`).emit('invite:received', invite.toObject());

  sendSuccess(res, { data: invite }, 201);
});

/** GET /api/invites  (incoming for current user) */
export const getInvites = asyncHandler(async (req: Request, res: Response) => {
  const invites = await Invite.find({ toUserId: req.user!._id })
    .populate('fromUserId', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();
  sendSuccess(res, { data: invites });
});

/** GET /api/invites/sent  (sent by current user) */
export const getSentInvites = asyncHandler(async (req: Request, res: Response) => {
  const invites = await Invite.find({ fromUserId: req.user!._id })
    .populate('toUserId', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();
  sendSuccess(res, { data: invites });
});

/** PATCH /api/invites/:id/accept */
export const acceptInvite = asyncHandler(async (req: Request, res: Response) => {
  const invite = await Invite.findOne({ _id: req.params.id, toUserId: req.user!._id });
  if (!invite) return sendError(res, 'Invite not found', 404);
  if (invite.status !== 'pending') return sendError(res, 'Invite is no longer pending');

  invite.status = 'accepted';
  await invite.save();

  const io = getIO();
  if (io) io.to(`user:${String(invite.fromUserId)}`).emit('invite:accepted', { inviteId: invite._id });

  sendSuccess(res, { data: invite });
});

/** PATCH /api/invites/:id/decline */
export const declineInvite = asyncHandler(async (req: Request, res: Response) => {
  const invite = await Invite.findOne({ _id: req.params.id, toUserId: req.user!._id });
  if (!invite) return sendError(res, 'Invite not found', 404);
  if (invite.status !== 'pending') return sendError(res, 'Invite is no longer pending');

  invite.status = 'declined';
  await invite.save();

  sendSuccess(res, { data: invite });
});
