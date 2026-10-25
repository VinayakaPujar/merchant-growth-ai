import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { scanReceipt } from '../services/receiptScannerService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/scan', requireAuth, upload.single('receipt'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Receipt image is required.' });
    }

    const result = await scanReceipt(req.file);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

export default router;
