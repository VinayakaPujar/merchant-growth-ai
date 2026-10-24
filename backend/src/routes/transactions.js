import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import {
  listTransactions,
  createTransaction,
  importTransactions
} from '../controllers/transactionsController.js';

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

const router = express.Router();

router.get('/', requireAuth, listTransactions);
router.post('/', requireAuth, createTransaction);
router.post('/import', requireAuth, upload.single('file'), importTransactions);

export default router;
