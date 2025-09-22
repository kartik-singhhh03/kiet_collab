import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const setupSocketIO = (io: SocketServer) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.name} (${user._id})`);

    // Join user to their personal room
    socket.join(`user:${user._id}`);

    // Handle joining chat rooms
    socket.on('join:room', (roomId: string) => {
      socket.join(roomId);
      socket.to(roomId).emit('user:joined', {
        userId: user._id,
        name: user.name,
        avatar: user.avatar
      });
    });

    // Handle leaving chat rooms
    socket.on('leave:room', (roomId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user:left', {
        userId: user._id,
        name: user.name
      });
    });

    // Handle chat messages (placeholder)
    socket.on('message:send', (data) => {
      // Implement message handling logic
      socket.to(data.roomId).emit('message:receive', {
        id: Date.now().toString(),
        content: data.content,
        author: {
          id: user._id,
          name: user.name,
          avatar: user.avatar
        },
        timestamp: new Date(),
        roomId: data.roomId
      });
    });

    // Handle typing indicators
    socket.on('typing:start', (roomId: string) => {
      socket.to(roomId).emit('typing:user', {
        userId: user._id,
        name: user.name,
        isTyping: true
      });
    });

    socket.on('typing:stop', (roomId: string) => {
      socket.to(roomId).emit('typing:user', {
        userId: user._id,
        name: user.name,
        isTyping: false
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.name} (${user._id})`);
    });
  });
};