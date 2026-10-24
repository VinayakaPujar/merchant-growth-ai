import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { registerMerchant, loginMerchant, getCurrentMerchant } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/register', authLimiter, registerMerchant);
router.post('/login', authLimiter, loginMerchant);
router.get('/me', requireAuth, getCurrentMerchant);

export default router;
