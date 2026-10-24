import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getForecast } from '../controllers/forecastController.js';

const router = express.Router();

router.get('/', requireAuth, getForecast);

export default router;
