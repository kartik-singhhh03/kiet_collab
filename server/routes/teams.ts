import { Router } from 'express';
import {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  joinTeam,
  leaveTeam,
} from '../controllers/teamController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get ('/',          listTeams);
router.get ('/:id',       getTeam);

// Authenticated routes
router.use(protect);
router.post('/',          createTeam);
router.patch('/:id',      updateTeam);
router.post ('/:id/join', joinTeam);
router.delete('/:id/leave', leaveTeam);

export default router;
