import { Router } from 'express';
import {
  createInvite,
  getInvites,
  getSentInvites,
  acceptInvite,
  declineInvite,
} from '../controllers/inviteController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post ('/',                createInvite);
router.get  ('/',                getInvites);
router.get  ('/sent',            getSentInvites);
router.patch('/:id/accept',      acceptInvite);
router.patch('/:id/decline',     declineInvite);

export default router;
