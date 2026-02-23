import { Router } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import Question from "../models/Question";

const router = Router();

// List questions
router.get("/posts", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { q, tag } = req.query as any;
    const query: any = {};
    if (q) query.$text = { $search: q };
    if (tag) query.tags = tag;

    const posts = await Question.find(query).sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: "Failed to get forum posts" });
  }
});

// Create question
router.post("/posts", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, content, tags } = req.body;
    const post = await Question.create({
      title,
      content,
      tags,
      author: req.user!._id,
    });
    res.status(201).json({ post });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create post" });
  }
});

// Answer a question
router.post(
  "/posts/:id/answers",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { content } = req.body;
      const post = await Question.findById(req.params.id);
      if (!post) return res.status(404).json({ error: "Post not found" });
      post.answers.push({ content, author: req.user!._id, votes: 0 } as any);
      await post.save();
      res.status(201).json({ post });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to answer" });
    }
  },
);

// Accept an answer (author only)
router.post(
  "/posts/:id/accept/:answerId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const post = await Question.findById(req.params.id);
      if (!post) return res.status(404).json({ error: "Post not found" });
      if (post.author.toString() !== req.user!._id.toString()) {
        return res
          .status(403)
          .json({ error: "Only the author can accept an answer" });
      }
      const ans = (post.answers as any).id(req.params.answerId);
      if (!ans) return res.status(404).json({ error: "Answer not found" });
      post.acceptedAnswer = ans._id as any;
      await post.save();
      res.json({ post });
    } catch (error) {
      res.status(500).json({ error: "Failed to accept answer" });
    }
  },
);

// Vote question
router.post(
  "/posts/:id/vote",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { delta } = req.body; // +1 or -1
      const post = await Question.findByIdAndUpdate(
        req.params.id,
        { $inc: { votes: delta } },
        { new: true },
      );
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json({ post });
    } catch (error) {
      res.status(500).json({ error: "Failed to vote" });
    }
  },
);

export default router;
