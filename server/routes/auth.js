const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign({ userId }, secret, { expiresIn });
}

function toUserJSON(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.__v;
  return obj;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (!normalizedEmail.endsWith('@kiet.edu')) {
      return res.status(400).json({ error: 'Email must end with @kiet.edu' });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({ name, email: normalizedEmail, password });
    await user.save();

    const token = signToken(user._id);
    return res.status(201).json({ token, user: toUserJSON(user) });
  } catch (err) {
    if (err && err.message === 'JWT_SECRET is not set') {
      return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET missing' });
    }
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    return res.json({ token, user: toUserJSON(user) });
  } catch (err) {
    if (err && err.message === 'JWT_SECRET is not set') {
      return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET missing' });
    }
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout (stateless JWT -> client discards token)
router.post('/logout', async (_req, res) => {
  return res.json({ message: 'Logged out' });
});

module.exports = router;
