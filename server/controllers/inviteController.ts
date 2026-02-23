import { Request, Response } from "express";
import Invite from "../models/Invite.js";
import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getIO } from "../sockets/socketHandler.js";
import { createAndEmit } from "./notificationController.js";

/** POST /api/invites */
export const createInvite = asyncHandler(
  async (req: Request, res: Response) => {
    const { toUserId, eventId, message } = req.body ?? {};
    if (!toUserId) return sendError(res, "toUserId is required");
    if (String(toUserId) === String(req.user!._id)) {
      return sendError(res, "Cannot invite yourself");
    }

    const invite = await Invite.create({
      fromUserId: req.user!._id,
      toUserId,
      eventId: eventId ?? null,
      message: message ?? "",
      status: "pending",
    });

    // Create persistent notification + real-time emit
    await createAndEmit({
      recipient: String(toUserId),
      sender: String(req.user!._id),
      type: "team_invite",
      message: `${req.user!.name} invited you to join their team.`,
      related_invite: String(invite._id),
    });

    sendSuccess(res, { data: invite }, 201);
  },
);

/** GET /api/invites  (incoming for current user) */
export const getInvites = asyncHandler(async (req: Request, res: Response) => {
  const invites = await Invite.find({ toUserId: req.user!._id })
    .populate("fromUserId", "name email avatar")
    .sort({ createdAt: -1 })
    .lean();
  sendSuccess(res, { data: invites });
});

/** GET /api/invites/sent  (sent by current user) */
export const getSentInvites = asyncHandler(
  async (req: Request, res: Response) => {
    const invites = await Invite.find({ fromUserId: req.user!._id })
      .populate("toUserId", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();
    sendSuccess(res, { data: invites });
  },
);

/** PATCH /api/invites/:id/accept */
export const acceptInvite = asyncHandler(
  async (req: Request, res: Response) => {
    const invite = await Invite.findOne({
      _id: req.params.id,
      toUserId: req.user!._id,
    });
    if (!invite) return sendError(res, "Invite not found", 404);
    if (invite.status !== "pending")
      return sendError(res, "Invite is no longer pending");

    invite.status = "accepted";
    await invite.save();

    // Notify the original sender
    await createAndEmit({
      recipient: String(invite.fromUserId),
      sender: String(req.user!._id),
      type: "invite_accepted",
      message: `${req.user!.name} accepted your team invite!`,
      related_invite: String(invite._id),
    });

    sendSuccess(res, { data: invite });
  },
);

/** PATCH /api/invites/:id/decline */
export const declineInvite = asyncHandler(
  async (req: Request, res: Response) => {
    const invite = await Invite.findOne({
      _id: req.params.id,
      toUserId: req.user!._id,
    });
    if (!invite) return sendError(res, "Invite not found", 404);
    if (invite.status !== "pending")
      return sendError(res, "Invite is no longer pending");

    invite.status = "declined";
    await invite.save();

    // Notify the original sender
    await createAndEmit({
      recipient: String(invite.fromUserId),
      sender: String(req.user!._id),
      type: "invite_rejected",
      message: `${req.user!.name} declined your team invite.`,
      related_invite: String(invite._id),
    });

    sendSuccess(res, { data: invite });
  },
);
