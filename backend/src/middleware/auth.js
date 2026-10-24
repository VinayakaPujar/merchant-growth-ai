import jwt from 'jsonwebtoken';
import Merchant from '../models/Merchant.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid bearer token.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const secret = process.env.JWT_SECRET || 'merchant-growth-ai-dev-secret';
    const payload = jwt.verify(token, secret);

    const merchant = await Merchant.findById(payload.id).select('-passwordHash');

    if (!merchant) {
      return res.status(401).json({ message: 'Merchant session is no longer valid.' });
    }

    req.user = { id: merchant._id.toString(), email: merchant.email, merchant };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed.' });
  }
}
