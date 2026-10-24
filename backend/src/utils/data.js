import Merchant from '../models/Merchant.js';
import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';

export async function ensureMerchantExists(merchantId) {
  const merchant = await Merchant.findById(merchantId);
  if (!merchant) {
    const error = new Error('Merchant not found.');
    error.statusCode = 404;
    throw error;
  }
  return merchant;
}

export async function getMerchantTransactionScope(merchantId) {
  const [transactions, products] = await Promise.all([
    Transaction.find({ merchantId }).sort({ createdAt: -1 }).lean(),
    Product.find({ merchantId }).lean()
  ]);

  return { transactions, products };
}
