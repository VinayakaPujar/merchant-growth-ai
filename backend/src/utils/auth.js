import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export function createToken(merchant) {
  const secret = process.env.JWT_SECRET || 'merchant-growth-ai-dev-secret';
  return jwt.sign({ id: merchant._id.toString(), email: merchant.email }, secret, { expiresIn: '7d' });
}

export async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
