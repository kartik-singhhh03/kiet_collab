import { Router } from 'express';
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  registerForEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = Router();

router.get ('/',            listEvents);
router.get ('/:id',         getEvent);

// Authenticated routes
router.use(protect);
router.post('/',            roleGuard('admin', 'faculty'), createEvent);
router.patch('/:id',        roleGuard('admin', 'faculty'), updateEvent);
router.post ('/:id/register', registerForEvent);
router.delete('/:id',       roleGuard('admin'), deleteEvent);

export default router;
