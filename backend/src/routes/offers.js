import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateOffers } from '../controllers/offersController.js';

const router = express.Router();

router.post('/', requireAuth, generateOffers);

export default router;
