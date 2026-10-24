import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getInsights } from '../controllers/insightsController.js';

const router = express.Router();

router.get('/', requireAuth, getInsights);

export default router;
