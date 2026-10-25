import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateOfferCopy } from '../services/offerCopyService.js';

const router = express.Router();

router.post('/generate-copy', requireAuth, async (req, res, next) => {
  try {
    const { offer } = req.body;
    if (!offer) {
      return res.status(400).json({ message: 'Offer data is required.' });
    }

    const copy = await generateOfferCopy({ offer });
    return res.json(copy);
  } catch (error) {
    return next(error);
  }
});

export default router;
