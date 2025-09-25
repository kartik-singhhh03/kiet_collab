const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

let ioRef;

function getIO() {
  return ioRef;
}

function attachSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (e) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = String(socket.user._id);
    socket.join(`user:${userId}`);

    io.emit('presence:update', { userId, status: 'online' });

    socket.on('private:message', ({ toUserId, text }) => {
      if (!toUserId || !text) return;
      const payload = {
        fromUserId: userId,
        text,
        timestamp: new Date().toISOString()
      };
      io.to(`user:${toUserId}`).emit('private:message', payload);
    });

    socket.on('disconnect', () => {
      io.emit('presence:update', { userId, status: 'offline' });
    });
  });

  ioRef = io;
  return io;
}

module.exports = attachSocketIO;
module.exports.getIO = getIO;
