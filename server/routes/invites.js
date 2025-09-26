const express = require('express');
const jwt = require('jsonwebtoken');
const Invite = require('../models/Invite');
const User = require('../models/User');
const { getIO } = require('../socket');

const router = express.Router();

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

// POST /api/invites (create)
router.post('/', auth, async (req, res) => {
  try {
    const { toUserId, eventId, message } = req.body || {};
    if (!toUserId) return res.status(400).json({ error: 'toUserId is required' });
    if (String(toUserId) === String(req.user._id)) {
      return res.status(400).json({ error: 'Cannot invite yourself' });
    }

    const invite = await Invite.create({
      fromUserId: req.user._id,
      toUserId,
      eventId: eventId || null,
      message: message || '',
      status: 'pending'
    });

    const io = getIO();
    if (io) {
      io.to(`user:${toUserId}`).emit('invite:received', invite.toObject());
    }

    return res.status(201).json(invite);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create invite' });
  }
});

// GET /api/invites (for current user, incoming)
router.get('/', auth, async (req, res) => {
  try {
    const invites = await Invite.find({ toUserId: req.user._id }).sort({ createdAt: -1 });
    return res.json(invites);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch invites' });
  }
});

// PATCH /api/invites/:id/accept
router.patch('/:id/accept', auth, async (req, res) => {
  try {
    const invite = await Invite.findOne({ _id: req.params.id, toUserId: req.user._id });
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    invite.status = 'accepted';
    await invite.save();
    return res.json(invite);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to accept invite' });
  }
});

// PATCH /api/invites/:id/decline
router.patch('/:id/decline', auth, async (req, res) => {
  try {
    const invite = await Invite.findOne({ _id: req.params.id, toUserId: req.user._id });
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    invite.status = 'declined';
    await invite.save();
    return res.json(invite);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to decline invite' });
  }
});

module.exports = router;
