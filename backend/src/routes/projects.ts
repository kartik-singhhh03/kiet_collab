import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Project from '../models/Project';

const router = Router();

// List projects
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { q, event } = req.query as any;
    const query: any = {};
    if (q) query.$text = { $search: q };
    if (event) query.event = event;

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Get project
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get project' });
  }
});

export default router;
