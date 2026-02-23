import React, { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  Bell,
  X,
  Check,
  XCircle,
  Megaphone,
  MessageCircle,
  Award,
  UserPlus,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/* ── Types ─────────────────────────────────────────────── */
interface Notification {
  _id: string;
  type:
    | "team_invite"
    | "invite_accepted"
    | "invite_rejected"
    | "announcement"
    | "new_message"
    | "badge_earned";
  message: string;
  is_read: boolean;
  related_invite?: string;
  related_team?: string;
  related_event?: string;
  createdAt: string;
  sender?: { _id: string; name: string; avatar?: string };
}

interface NotificationBellProps {
  userId: string;
}

/* ── Helpers ────────────────────────────────────────────── */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function typeIcon(type: Notification["type"]) {
  const s = { width: 16, height: 16 };
  if (type === "team_invite") return <UserPlus {...s} color="#6366f1" />;
  if (type === "invite_accepted") return <Check {...s} color="#22c55e" />;
  if (type === "invite_rejected") return <XCircle {...s} color="#ef4444" />;
  if (type === "announcement") return <Megaphone {...s} color="#f59e0b" />;
  if (type === "new_message") return <MessageCircle {...s} color="#38bdf8" />;
  if (type === "badge_earned") return <Award {...s} color="#a855f7" />;
  return null;
}

/* ── Main Component ─────────────────────────────────────── */
export default function NotificationBell({ userId }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState<Record<string, boolean>>(
    {},
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const token = localStorage.getItem("accessToken");

  /* ── Fetch helpers ── */
  const authHeader = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ?? ""}`,
    }),
    [token],
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API}/api/notifications/unread-count`, {
        headers: authHeader(),
      });
      if (r.ok) {
        const d = await r.json();
        setUnread(d.count ?? d.data?.count ?? 0);
      }
    } catch {
      /* silent */
    }
  }, [token, authHeader]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/notifications?limit=30`, {
        headers: authHeader(),
      });
      if (r.ok) {
        const d = await r.json();
        const list: Notification[] = d.data ?? d.notifications ?? [];
        setNotifications(list);
        setUnread(list.filter((n) => !n.is_read).length);
      }
    } catch {
      /* silent */
    }
    setLoading(false);
  }, [token, authHeader]);

  /* ── Socket.IO ── */
  useEffect(() => {
    if (!token || !userId) return;

    const socket = io(API, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("newNotification", (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnread((u) => u + 1);
    });

    fetchUnreadCount();

    return () => {
      socket.disconnect();
    };
  }, [userId, token, fetchUnreadCount]);

  /* ── Open dropdown → fetch ── */
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  /* ── Close on outside click ── */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* ── Mark single read ── */
  const markRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n)),
      );
      setUnread((u) => Math.max(0, u - 1));
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: authHeader(),
      });
    },
    [authHeader],
  );

  /* ── Mark all read ── */
  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    await fetch(`${API}/api/notifications/mark-all-read`, {
      method: "PATCH",
      headers: authHeader(),
    });
  }, [authHeader]);

  /* ── Invite actions ── */
  const handleInviteAction = useCallback(
    async (notif: Notification, action: "accept" | "decline") => {
      if (!notif.related_invite) return;
      setInviteLoading((p) => ({ ...p, [notif._id]: true }));
      try {
        await fetch(`${API}/api/invites/${notif.related_invite}/${action}`, {
          method: "PATCH",
          headers: authHeader(),
        });
        await markRead(notif._id);
        // Remove the invite notification from list (already handled)
        setNotifications((prev) => prev.filter((n) => n._id !== notif._id));
      } catch {
        /* silent */
      }
      setInviteLoading((p) => ({ ...p, [notif._id]: false }));
    },
    [authHeader, markRead],
  );

  /* ── Delete notification ── */
  const deleteNotif = useCallback(
    async (id: string) => {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnread((u) => {
        const wasUnread =
          notifications.find((n) => n._id === id)?.is_read === false;
        return wasUnread ? Math.max(0, u - 1) : u;
      });
      await fetch(`${API}/api/notifications/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
    },
    [authHeader, notifications],
  );

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div
      ref={dropdownRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: open ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#e2e8f0",
          transition: "background 0.2s",
        }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ef4444",
              border: "1.5px solid #0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {unread > 9 ? "9+" : ""}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 360,
            maxHeight: 520,
            borderRadius: 12,
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px 10px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>
              Notifications{" "}
              {unread > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    background: "#ef4444",
                    borderRadius: 10,
                    padding: "1px 6px",
                    fontSize: 11,
                    color: "#fff",
                  }}
                >
                  {unread}
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: 12,
                  color: "#6366f1",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading && (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                Loading…
              </div>
            )}
            {!loading && notifications.length === 0 && (
              <div
                style={{ padding: 32, textAlign: "center", color: "#64748b" }}
              >
                <Bell size={28} color="#334155" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 13, margin: 0 }}>No notifications yet</p>
              </div>
            )}
            {!loading &&
              notifications.map((n) => (
                <NotifRow
                  key={n._id}
                  notif={n}
                  onRead={markRead}
                  onDelete={deleteNotif}
                  onInviteAction={handleInviteAction}
                  inviteLoading={!!inviteLoading[n._id]}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Notification Row ───────────────────────────────────── */
interface RowProps {
  notif: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onInviteAction: (n: Notification, action: "accept" | "decline") => void;
  inviteLoading: boolean;
}

function NotifRow({
  notif,
  onRead,
  onDelete,
  onInviteAction,
  inviteLoading,
}: RowProps) {
  const isInvite = notif.type === "team_invite" && notif.related_invite;

  return (
    <div
      onClick={() => {
        if (!notif.is_read) onRead(notif._id);
      }}
      style={{
        padding: "12px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: notif.is_read ? "transparent" : "rgba(99,102,241,0.06)",
        cursor: notif.is_read ? "default" : "pointer",
        position: "relative",
        transition: "background 0.15s",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {/* Icon */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {typeIcon(notif.type)}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#e2e8f0",
              lineHeight: 1.4,
            }}
          >
            {notif.message}
          </p>
          <span
            style={{
              fontSize: 11,
              color: "#64748b",
              marginTop: 2,
              display: "block",
            }}
          >
            {timeAgo(notif.createdAt)}
          </span>

          {/* Accept / Decline buttons for team invites */}
          {isInvite && (
            <div
              style={{ display: "flex", gap: 6, marginTop: 8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                disabled={inviteLoading}
                onClick={() => onInviteAction(notif, "accept")}
                style={{
                  padding: "4px 12px",
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: inviteLoading ? "wait" : "pointer",
                  opacity: inviteLoading ? 0.7 : 1,
                }}
              >
                {inviteLoading ? "…" : "Accept"}
              </button>
              <button
                disabled={inviteLoading}
                onClick={() => onInviteAction(notif, "decline")}
                style={{
                  padding: "4px 12px",
                  background: "rgba(239,68,68,0.15)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: inviteLoading ? "wait" : "pointer",
                  opacity: inviteLoading ? 0.7 : 1,
                }}
              >
                Decline
              </button>
            </div>
          )}
        </div>

        {/* Unread dot + delete */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {!notif.is_read && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#6366f1",
                display: "block",
                marginTop: 4,
              }}
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notif._id);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#475569",
              padding: 2,
              display: "flex",
              alignItems: "center",
            }}
            title="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
