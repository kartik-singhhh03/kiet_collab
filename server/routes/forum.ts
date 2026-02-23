import { Router } from 'express';
import {
  listQuestions,
  getQuestion,
  createQuestion,
  addAnswer,
  acceptAnswer,
  upvoteQuestion,
} from '../controllers/forumController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get ('/',                                  listQuestions);
router.get ('/:id',                               getQuestion);

// Authenticated actions
router.use(protect);
router.post('/',                                  createQuestion);
router.post('/:id/answers',                       addAnswer);
router.patch('/:id/answers/:answerId/accept',     acceptAnswer);
router.post ('/:id/upvote',                       upvoteQuestion);

export default router;
