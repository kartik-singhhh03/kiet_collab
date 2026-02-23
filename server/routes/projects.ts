import { Router } from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  toggleLike,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { uploadProjectCover } from '../middleware/upload.js';

const router = Router();

router.get ('/',           listProjects);
router.get ('/:id',        getProject);

// Authenticated routes
router.use(protect);
router.post('/',            uploadProjectCover.single('coverImage'), createProject);
router.patch('/:id',        uploadProjectCover.single('coverImage'), updateProject);
router.delete('/:id',       deleteProject);
router.post ('/:id/like',   toggleLike);

export default router;
