require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const authRouter = require('./routes/auth');
const attachSocketIO = require('./socket');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

// Connect MongoDB
if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI not set. Set it to enable DB operations.');
}
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kiet-collab', {
    maxPoolSize: 10
  })
  .then(() => console.log('MongoDB connected'))
  .catch((e) => console.error('MongoDB connection error', e));

// JWT auth middleware
async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Routes
app.use('/api/auth', authRouter);
app.get('/api/me', auth, (req, res) => {
  const u = req.user.toObject();
  delete u.password;
  delete u.__v;
  res.json(u);
});

// Server & Socket.IO
const server = http.createServer(app);
attachSocketIO(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

module.exports = app;
