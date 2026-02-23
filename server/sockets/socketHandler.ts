import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';
import Message from '../models/Message.js';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

/** Socket augmented with authenticated user */
interface AuthSocket extends Socket {
  user: IUser;
}

/* ─── Online-user tracking ──────────────────────────────────────────────────── */

/** userId → Set of active socketIds  (one user may have multiple tabs/devices) */
const onlineUsers = new Map<string, Set<string>>();

function addOnlineUser(userId: string, socketId: string): void {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId)!.add(socketId);
}

/**
 * Remove a socket from the user's set.
 * Returns true only when the LAST socket for that user is gone (→ user is now offline).
 */
function removeOnlineUser(userId: string, socketId: string): boolean {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }
  return false;
}

/** Expose the online user list to REST controllers that need it. */
export function getOnlineUsers(): string[] {
  return Array.from(onlineUsers.keys());
}

/* ─── Global IO reference ───────────────────────────────────────────────────── */

let ioRef: Server | null = null;

export function getIO(): Server | null {
  return ioRef;
}

/* ─── attachSocketIO ────────────────────────────────────────────────────────── */

/**
 * Attach Socket.IO to the existing HTTP server.
 * JWT is verified in the handshake — no anonymous connections are accepted.
 */
export function attachSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin:      process.env.FRONTEND_URL ?? '*',
      methods:     ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout:  60_000,
    pingInterval: 25_000,
  });

  /* ─── JWT handshake middleware ─────────────────────────────────────────── */

  io.use(async (socket, next) => {
    try {
      // Token may arrive as:  socket.handshake.auth.token
      //                   or  Authorization: Bearer <token>  header
      const token =
        (socket.handshake.auth as Record<string, string>)?.token ??
        (socket.handshake.headers['authorization'] as string | undefined)
          ?.split(' ')[1];

      if (!token) return next(new Error('Authentication error: token missing'));

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as { userId: string };

      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('Authentication error: user not found'));

      (socket as AuthSocket).user = user;
      next();
    } catch {
      next(new Error('Authentication error: invalid token'));
    }
  });

  /* ─── Connection ───────────────────────────────────────────────────────── */

  io.on('connection', (rawSocket) => {
    const socket = rawSocket as AuthSocket;
    const userId = String(socket.user._id);

    // Put every user in a private room so targeted emits are possible
    socket.join(`user:${userId}`);
    addOnlineUser(userId, socket.id);
    console.log(
      `🟢  [socket] ${socket.user.name} connected  (sid: ${socket.id})`
    );

    /* ── userOnline  ─────────────────────────────────────────────────────
       Broadcast to ALL connected clients so they can update their UI.       */
    io.emit('userOnline', {
      userId,
      name:     socket.user.name,
      avatar:   socket.user.avatar,
      onlineAt: new Date().toISOString(),
    });

    /* ── joinRoom  ───────────────────────────────────────────────────────
       Client payload: { teamId: string }
       Adds the socket to the Socket.IO room for that team.                 */
    socket.on('joinRoom', ({ teamId }: { teamId: string }) => {
      if (!teamId) return;
      socket.join(`team:${teamId}`);
      console.log(`   ↳ ${socket.user.name} joined room  team:${teamId}`);
    });

    /* ── sendMessage  ────────────────────────────────────────────────────
       Client payload: { teamId: string; message: string }
       1. Validates input
       2. Persists to MongoDB
       3. Broadcasts receiveMessage to the entire team room               */
    socket.on(
      'sendMessage',
      async ({
        teamId,
        message,
      }: {
        teamId: string;
        message: string;
      }) => {
        if (!teamId || !message?.trim()) return;

        try {
          const timestamp = new Date();

          const saved = await Message.create({
            team_id:   teamId,
            sender_id: userId,
            message:   message.trim(),
            timestamp,
          });

          /* ── receiveMessage  ───────────────────────────────────────────
             Emitted to EVERY socket in the team room (including sender)
             so the sender gets the DB-assigned _id and final timestamp.  */
          io.to(`team:${teamId}`).emit('receiveMessage', {
            _id:          saved._id,
            team_id:      teamId,
            sender_id:    userId,
            senderName:   socket.user.name,
            senderAvatar: socket.user.avatar ?? '',
            message:      saved.message,
            timestamp:    saved.timestamp.toISOString(),
          });
        } catch (err) {
          console.error('[socket] sendMessage error:', err);
          socket.emit('error', { message: 'Failed to send message' });
        }
      }
    );

    /* ── leaveRoom  ──────────────────────────────────────────────────────
       Client payload: { teamId: string }                                 */
    socket.on('leaveRoom', ({ teamId }: { teamId: string }) => {
      if (!teamId) return;
      socket.leave(`team:${teamId}`);
    });

    /* ── Typing indicators (bonus quality-of-life) ───────────────────────
       Client payload: { teamId: string }                                 */
    socket.on('typing:start', ({ teamId }: { teamId: string }) => {
      socket.to(`team:${teamId}`).emit('typing:start', {
        userId,
        name: socket.user.name,
      });
    });

    socket.on('typing:stop', ({ teamId }: { teamId: string }) => {
      socket.to(`team:${teamId}`).emit('typing:stop', { userId });
    });

    /* ── disconnect  ─────────────────────────────────────────────────────
       userOffline is only broadcast when the LAST socket for the user
       goes away (handles multiple tabs / devices gracefully).             */
    socket.on('disconnect', () => {
      const wentOffline = removeOnlineUser(userId, socket.id);
      if (wentOffline) {
        io.emit('userOffline', {
          userId,
          offlineAt: new Date().toISOString(),
        });
        console.log(`🔴  [socket] ${socket.user.name} offline`);
      }
    });
  });

  ioRef = io;
  return io;
}
