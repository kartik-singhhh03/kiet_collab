import { Router } from 'express';
import {
  listUsers,
  searchUsers,
  getUserById,
  updateProfile,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = Router();

// All user routes require authentication
router.use(protect);

router.get ('/',          roleGuard('admin'), listUsers);
router.get ('/search',    searchUsers);
router.get ('/:id',       getUserById);
router.patch('/me',       uploadAvatar.single('avatar'), updateProfile);
router.delete('/:id',     roleGuard('admin'), deleteUser);

export default router;
