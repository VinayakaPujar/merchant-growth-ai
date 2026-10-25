import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMerchantAnomalySummary } from '../services/anomalyService.js';

const router = express.Router();
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const result = await getMerchantAnomalySummary(req.user.id);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

export default router;
