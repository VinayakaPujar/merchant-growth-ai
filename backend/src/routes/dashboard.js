import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDashboardMetrics } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/', requireAuth, getDashboardMetrics);

export default router;
