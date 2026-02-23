import { Router } from "express";
import {
  listNotifications,
  getUnreadCount,
  markOneRead,
  markAllRead,
  deleteNotification,
  broadcastAnnouncement,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// All notification routes require authentication
router.use(protect);

// ── Listing & counts ──────────────────────────────────────────────────────────
router.get("/", listNotifications);
router.get("/unread-count", getUnreadCount);

// ── Bulk mark-read ────────────────────────────────────────────────────────────
router.patch("/mark-all-read", markAllRead);

// ── Per-notification ──────────────────────────────────────────────────────────
router.patch("/:id/read", markOneRead);
router.delete("/:id", deleteNotification);

// ── Admin broadcast ───────────────────────────────────────────────────────────
router.post("/", broadcastAnnouncement);

export default router;
