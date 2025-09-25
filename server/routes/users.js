const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/users/search?skills=a,b,c&availability=available
router.get('/search', async (req, res) => {
  try {
    const skillsParam = String(req.query.skills || '').trim();
    if (!skillsParam) {
      return res.status(400).json({ error: 'skills query param is required (comma-separated)' });
    }
    const requestedSkills = skillsParam
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const availability = req.query.availability && String(req.query.availability);

    const query = { skills: { $in: requestedSkills } };
    if (availability) query.availability = availability;

    const users = await User.find(query).select('+password');

    const results = users.map((u) => {
      const userSkills = (u.skills || []).map((s) => String(s).toLowerCase());
      const matching = requestedSkills.filter((s) => userSkills.includes(s));
      const matchScore = requestedSkills.length > 0 ? matching.length / requestedSkills.length : 0;
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        availability: u.availability,
        skills: u.skills,
        matchScore,
        lastActive: u.lastActive || null
      };
    });

    return res.json(results);
  } catch (e) {
    return res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
