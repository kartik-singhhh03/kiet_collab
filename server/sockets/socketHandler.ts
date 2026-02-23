import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';

/** Augment Socket to carry the authenticated user */
interface AuthSocket extends Socket {
  user: IUser;
}

let ioRef: Server | null = null;

/** Return the global Socket.IO instance (available after attachSocketIO is called). */
export function getIO(): Server | null {
  return ioRef;
}

/**
 * Initialise Socket.IO, attach JWT auth middleware, and register all event handlers.
 * Call this once, passing the HTTP server created in server.ts.
 */
export function attachSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // ─── Auth middleware ─────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        (socket.handshake.auth as Record<string, string>)?.token ??
        (socket.handshake.headers['authorization'] as string)?.split(' ')[1];

      if (!token) return next(new Error('Authentication error: token missing'));

      const secret = process.env.JWT_SECRET!;
      const decoded = jwt.verify(token, secret) as { userId: string };

      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('Authentication error: user not found'));

      (socket as AuthSocket).user = user;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  // ─── Connection handler ──────────────────────────────────────────────────────
  io.on('connection', (rawSocket) => {
    const socket = rawSocket as AuthSocket;
    const userId = String(socket.user._id);

    // Each user joins their private room
    socket.join(`user:${userId}`);
    console.log(`🟢  Socket connected: ${socket.user.name} (${userId})`);

    // Broadcast online status to all clients
    io.emit('presence:update', { userId, status: 'online' });

    // ── Private messaging ─────────────────────────────────────────────────────
    socket.on('private:message', ({ toUserId, text }: { toUserId: string; text: string }) => {
      if (!toUserId || !text) return;
      const payload = { fromUserId: userId, text, timestamp: new Date().toISOString() };
      io.to(`user:${toUserId}`).emit('private:message', payload);
    });

    // ── Team room ─────────────────────────────────────────────────────────────
    socket.on('team:join', ({ teamId }: { teamId: string }) => {
      if (!teamId) return;
      socket.join(`team:${teamId}`);
    });

    socket.on('team:message', ({ teamId, text }: { teamId: string; text: string }) => {
      if (!teamId || !text) return;
      io.to(`team:${teamId}`).emit('team:message', {
        fromUserId: userId,
        fromName: socket.user.name,
        text,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('team:leave', ({ teamId }: { teamId: string }) => {
      socket.leave(`team:${teamId}`);
    });

    // ── Typing indicators ─────────────────────────────────────────────────────
    socket.on('typing:start', ({ toUserId }: { toUserId: string }) => {
      io.to(`user:${toUserId}`).emit('typing:start', { fromUserId: userId });
    });

    socket.on('typing:stop', ({ toUserId }: { toUserId: string }) => {
      io.to(`user:${toUserId}`).emit('typing:stop', { fromUserId: userId });
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      io.emit('presence:update', { userId, status: 'offline' });
      console.log(`🔴  Socket disconnected: ${userId}`);
    });
  });

  ioRef = io;
  return io;
}
