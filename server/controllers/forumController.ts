import { Request, Response } from 'express';
import Question from '../models/Question.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** GET /api/forum/questions */
export const listQuestions = asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 15);
  const skip  = (page - 1) * limit;

  const filter: Record<string, unknown> = { isClosed: false };
  if (req.query.tag) filter.tags = req.query.tag;

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .populate('authorId', 'name avatar')
      .select('-answers')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Question.countDocuments(filter),
  ]);

  sendSuccess(res, { data: questions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

/** GET /api/forum/questions/:id */
export const getQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('authorId', 'name avatar department')
    .populate('answers.authorId', 'name avatar')
    .lean();

  if (!question) return sendError(res, 'Question not found', 404);
  sendSuccess(res, { data: question });
});

/** POST /api/forum/questions */
export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { title, body, tags } = req.body ?? {};
  if (!title || !body) return sendError(res, 'title and body are required');

  const question = await Question.create({
    title,
    body,
    tags: Array.isArray(tags) ? tags : (tags ?? '').split(',').map((t: string) => t.trim()).filter(Boolean),
    authorId: req.user!._id,
  });

  sendSuccess(res, { data: question }, 201);
});

/** POST /api/forum/questions/:id/answers */
export const addAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { body } = req.body ?? {};
  if (!body) return sendError(res, 'body is required');

  const question = await Question.findById(req.params.id);
  if (!question) return sendError(res, 'Question not found', 404);
  if (question.isClosed) return sendError(res, 'Question is closed');

  question.answers.push({ authorId: req.user!._id as any, body, upvotes: [], isAccepted: false });
  await question.save();
  sendSuccess(res, { data: question.answers[question.answers.length - 1] }, 201);
});

/** PATCH /api/forum/questions/:id/answers/:answerId/accept */
export const acceptAnswer = asyncHandler(async (req: Request, res: Response) => {
  const question = await Question.findById(req.params.id);
  if (!question) return sendError(res, 'Question not found', 404);
  if (String(question.authorId) !== String(req.user!._id)) {
    return sendError(res, 'Only the question author can accept an answer', 403);
  }

  question.answers.forEach((a) => { a.isAccepted = false; });
  const answer = question.answers.id(req.params.answerId);
  if (!answer) return sendError(res, 'Answer not found', 404);
  answer.isAccepted = true;
  await question.save();
  sendSuccess(res, { data: answer });
});

/** POST /api/forum/questions/:id/upvote */
export const upvoteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await Question.findById(req.params.id);
  if (!question) return sendError(res, 'Question not found', 404);

  const uid = req.user!._id as any;
  const idx = question.upvotes.findIndex((id) => String(id) === String(uid));
  if (idx === -1) question.upvotes.push(uid);
  else            question.upvotes.splice(idx, 1);
  await question.save();
  sendSuccess(res, { upvotes: question.upvotes.length });
});
