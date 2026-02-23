import { Router } from 'express';
import {
  listUsers,
  searchUsers,
  getMe,
  updateMe,
  getUserById,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = Router();

// All user routes require authentication
router.use(protect);

// ── Admin list ────────────────────────────────────────────────────────────────
router.get('/',         roleGuard('admin'), listUsers);

// ── Search / discovery  (no :id conflict) ────────────────────────────────────
router.get('/search',   searchUsers);

// ── Own profile — /me must come BEFORE /:id ──────────────────────────────────
router.get ('/me',      getMe);
router.put ('/me',      uploadAvatar.single('avatar'), updateMe);

// ── Public user profile by ID ─────────────────────────────────────────────────
router.get('/:id',      getUserById);

// ── Admin delete ──────────────────────────────────────────────────────────────
router.delete('/:id',   roleGuard('admin'), deleteUser);

export default router;
