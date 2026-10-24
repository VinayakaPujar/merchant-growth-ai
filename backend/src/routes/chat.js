import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createChatReply } from '../controllers/chatController.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/', requireAuth, aiLimiter, createChatReply);

export default router;
