import { Request, Response } from "express";
import Notification, { NotificationType } from "../models/Notification.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getIO } from "../sockets/socketHandler.js";
import mongoose from "mongoose";

/* ─── Helpers ────────────────────────────────────────────────────────────────
 *
 * createAndEmit() is used by other controllers (inviteController, etc.) to
 * create notifications without going through HTTP.
 */
export async function createAndEmit(opts: {
  recipient: string;
  sender?: string | null;
  type: NotificationType;
  message: string;
  related_invite?: string | null;
  related_team?: string | null;
  related_event?: string | null;
}) {
  const notification = await Notification.create({
    recipient: opts.recipient,
    sender: opts.sender ?? null,
    type: opts.type,
    message: opts.message,
    related_invite: opts.related_invite ?? null,
    related_team: opts.related_team ?? null,
    related_event: opts.related_event ?? null,
  });

  // Populate sender for the real-time payload
  await notification.populate("sender", "name avatar");

  const io = getIO();
  if (io) {
    io.to(`user:${opts.recipient}`).emit(
      "newNotification",
      notification.toObject(),
    );
  }

  return notification;
}

/* ─── GET /api/notifications ─────────────────────────────────────────────────
 * Returns paginated notifications for the logged-in user, newest first.
 * Unread appear first within the page when ?unreadFirst=true (default true).
 */
export const listNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id;
    const page = Math.max(1, parseInt(String(req.query.page ?? "1")));
    const limit = Math.min(50, parseInt(String(req.query.limit ?? "30")));
    const unreadFirst = req.query.unreadFirst !== "false";

    const sort = unreadFirst
      ? { is_read: 1 as const, createdAt: -1 as const }
      : { createdAt: -1 as const };

    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("sender", "name avatar")
        .lean(),
      Notification.countDocuments({ recipient: userId }),
    ]);

    sendSuccess(res, {
      data: notifications,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  },
);

/* ─── GET /api/notifications/unread-count ────────────────────────────────── */
export const getUnreadCount = asyncHandler(
  async (req: Request, res: Response) => {
    const count = await Notification.countDocuments({
      recipient: req.user!._id,
      is_read: false,
    });
    sendSuccess(res, { data: { count } });
  },
);

/* ─── PATCH /api/notifications/:id/read ──────────────────────────────────── */
export const markOneRead = asyncHandler(async (req: Request, res: Response) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user!._id },
    { is_read: true },
    { new: true },
  );
  if (!n) return sendError(res, "Notification not found", 404);
  sendSuccess(res, { data: n });
});

/* ─── PATCH /api/notifications/mark-all-read ─────────────────────────────── */
export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany(
    { recipient: req.user!._id, is_read: false },
    { is_read: true },
  );
  sendSuccess(res, { data: { message: "All notifications marked as read" } });
});

/* ─── DELETE /api/notifications/:id ─────────────────────────────────────── */
export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const n = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user!._id,
    });
    if (!n) return sendError(res, "Notification not found", 404);
    sendSuccess(res, { data: { message: "Deleted" } });
  },
);

/* ─── POST /api/notifications (admin broadcast) ──────────────────────────── */
export const broadcastAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    if (!["admin", "faculty"].includes(req.user!.role)) {
      return sendError(res, "Forbidden", 403);
    }

    const { message, recipientIds } = req.body ?? {};
    if (!message) return sendError(res, "message is required");

    const io = getIO();

    // If no recipientIds supplied, broadcast to everyone connected
    if (
      !recipientIds ||
      !Array.isArray(recipientIds) ||
      recipientIds.length === 0
    ) {
      // Store a single "global" notification template — emit in real-time only
      io?.emit("newNotification", {
        _id: new mongoose.Types.ObjectId(),
        recipient: null,
        sender: req.user!._id,
        type: "announcement",
        message,
        is_read: false,
        createdAt: new Date(),
      });
      return sendSuccess(res, { data: { message: "Broadcast sent" } }, 200);
    }

    // Targeted announcement
    const notifications = await Notification.insertMany(
      recipientIds.map((rid: string) => ({
        recipient: rid,
        sender: req.user!._id,
        type: "announcement",
        message,
      })),
    );

    if (io) {
      for (const n of notifications) {
        io.to(`user:${String(n.recipient)}`).emit(
          "newNotification",
          n.toObject(),
        );
      }
    }

    sendSuccess(res, { data: { count: notifications.length } }, 201);
  },
);
