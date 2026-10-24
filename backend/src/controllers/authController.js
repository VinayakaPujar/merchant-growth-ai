import bcrypt from 'bcryptjs';
import Merchant from '../models/Merchant.js';
import { createToken, hashPassword, comparePassword } from '../utils/auth.js';

export async function registerMerchant(req, res, next) {
  try {
    const { name, email, password, businessName, businessCategory, monthlyMarketingBudget } = req.body;

    if (!name || !email || !password || !businessName || !businessCategory) {
      return res.status(400).json({ message: 'Name, email, password, business name, and category are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingMerchant = await Merchant.findOne({ email: email.toLowerCase().trim() });
    if (existingMerchant) {
      return res.status(409).json({ message: 'A merchant with this email already exists.' });
    }

    const newMerchant = await Merchant.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: await hashPassword(password),
      businessName: businessName.trim(),
      businessCategory: businessCategory.trim(),
      monthlyMarketingBudget: Number(monthlyMarketingBudget || 0)
    });

    const merchantObject = newMerchant.toObject();
    delete merchantObject.passwordHash;

    const token = createToken(newMerchant);

    return res.status(201).json({
      token,
      merchant: merchantObject,
      message: 'Merchant account created successfully.'
    });
  } catch (error) {
    return next(error);
  }
}

export async function loginMerchant(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const merchant = await Merchant.findOne({ email: email.toLowerCase().trim() });
    if (!merchant) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValid = await comparePassword(password, merchant.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const merchantObject = merchant.toObject();
    delete merchantObject.passwordHash;

    const token = createToken(merchant);

    return res.json({
      token,
      merchant: merchantObject,
      message: 'Login successful.'
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentMerchant(req, res) {
  return res.json({ merchant: req.user.merchant });
}
