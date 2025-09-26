import { Router } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Event from '../models/Event';
import Project from '../models/Project';
import Question from '../models/Question';

const router = Router();

router.get('/metrics', authenticateToken, requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const [users, events, projects, posts] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Project.countDocuments(),
      Question.countDocuments()
    ]);

    res.json({
      users,
      events,
      projects,
      posts
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
