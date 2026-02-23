import { Router } from "express";
import {
  authenticateToken,
  AuthRequest,
  requireRole,
} from "../middleware/auth";
import Event from "../models/Event";
import Team from "../models/Team";
import Project from "../models/Project";

const router = Router();

// List events with filters
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, q, upcoming } = req.query as any;
    const query: any = {};
    if (status) query.status = status;
    if (q) query.$text = { $search: q };
    if (upcoming === "true") query.startDate = { $gte: new Date() };

    const events = await Event.find(query).sort({ startDate: 1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: "Failed to get events" });
  }
});

// Get single event
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: "Failed to get event" });
  }
});

// Create event (admin)
router.post(
  "/",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const payload = req.body;
      const event = await Event.create({
        ...payload,
        createdBy: req.user!._id,
      });
      res.status(201).json({ event });
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Failed to create event" });
    }
  },
);

// Update event (admin)
router.patch(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json({ event });
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Failed to update event" });
    }
  },
);

// Delete event (admin)
router.delete(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const event = await Event.findByIdAndDelete(req.params.id);
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json({ message: "Event deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  },
);

// Register for event
router.post(
  "/:id/register",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ error: "Event not found" });

      const already = event.registrations.find(
        (r) => r.user.toString() === req.user!._id.toString(),
      );
      if (already) return res.status(400).json({ error: "Already registered" });

      event.registrations.push({
        user: req.user!._id,
        registeredAt: new Date(),
      } as any);
      await event.save();
      res.status(201).json({ message: "Registered successfully" });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  },
);

// Create team in event
router.post("/:id/teams", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const { name, members } = req.body;
    const team = await Team.create({
      name,
      event: event._id,
      members: [{ user: req.user!._id, role: "leader" }, ...(members || [])],
      createdBy: req.user!._id,
    });

    event.teams.push(team._id as any);
    await event.save();

    res.status(201).json({ team });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Team creation failed" });
  }
});

// Submit project to event
router.post("/:id/submit", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const { title, description, repoUrl, demoUrl, screenshots, tags, teamId } =
      req.body;

    const team = await Team.findById(teamId);
    if (!team || team.event.toString() !== (event._id as any).toString()) {
      return res.status(400).json({ error: "Invalid team" });
    }

    const project = await Project.create({
      title,
      description,
      repoUrl,
      demoUrl,
      screenshots,
      tags,
      submittedBy: req.user!._id,
      event: event._id,
      team: team._id,
    });

    team.project = project._id as any;
    await team.save();

    res.status(201).json({ project });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Submission failed" });
  }
});

export default router;
