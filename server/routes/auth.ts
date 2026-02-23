import { Router } from 'express';
import { signup, register, login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Primary signup route
router.post('/signup',   authLimiter, signup);
// Alias kept for backward compat
router.post('/register', authLimiter, register);

router.post('/login',    authLimiter, login);
router.post('/logout',   protect,     logout);
router.get ('/me',       protect,     getMe);

export default router;
