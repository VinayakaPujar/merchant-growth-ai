import { safeNumber, normalizeCSVRows, roundCurrency, safeDate } from '../utils/metrics.js';
import Transaction from '../models/Transaction.js';

export async function listTransactions(req, res, next) {
  try {
    const merchantId = req.user.id;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const statusFilter = req.query.status ? String(req.query.status).toLowerCase() : null;
    const search = req.query.search ? String(req.query.search).trim() : '';

    const query = { merchantId };
    if (statusFilter) {
      query.status = statusFilter;
    }
    if (search) {
      query.productName = { $regex: search, $options: 'i' };
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      transactions: transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount || 0),
        createdAt: new Date(tx.createdAt).toISOString()
      }))
    });
  } catch (error) {
    return next(error);
  }
}

export async function createTransaction(req, res, next) {
  try {
    const merchantId = req.user.id;
    const { amount, status, productName, quantity, createdAt } = req.body;

    if (!amount || !status || !productName) {
      return res.status(400).json({ message: 'Amount, status, and product name are required.' });
    }

    if (!['success', 'failed', 'refunded'].includes(String(status).toLowerCase())) {
      return res.status(400).json({ message: 'Status must be success, failed, or refunded.' });
    }

    const normalizedAmount = safeNumber(amount, -1);
    if (normalizedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero.' });
    }

    const quantityValue = safeNumber(quantity || 1, 1);
    if (quantityValue < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const tx = await Transaction.create({
      merchantId,
      amount: roundCurrency(normalizedAmount),
      status: String(status).toLowerCase(),
      productName: String(productName).trim(),
      quantity: Math.round(quantityValue),
      createdAt: createdAt ? safeDate(createdAt) : new Date(),
      source: 'manual-entry',
      isDemoData: false
    });

    return res.status(201).json({ message: 'Transaction added successfully.', transaction: tx });
  } catch (error) {
    return next(error);
  }
}

export async function importTransactions(req, res, next) {
  try {
    const merchantId = req.user.id;
    const csvText = req.file?.buffer?.toString() || req.body.csvText || '';

    if (!csvText.trim()) {
      return res.status(400).json({ message: 'CSV content is required for import.' });
    }

    const rows = normalizeCSVRows(csvText);
    const normalizedRows = rows.map((row) => ({
      date: row.date || row.Date || row.createdAt || row.created_at,
      productName: row.productName || row.product_name || row.product || row.Product,
      amount: row.amount || row.Amount || row.total || row.Total,
      quantity: row.quantity || row.Quantity || 1,
      status: row.status || row.Status
    }));

    const invalidRows = normalizedRows.filter((row) => {
      const required = [row.date, row.productName, row.amount, row.status];
      return required.some((value) => !value || String(value).trim() === '');
    });

    if (invalidRows.length) {
      return res.status(400).json({
        message: 'CSV validation failed. Required columns: date, productName, amount, status.',
        invalidRows: invalidRows.length
      });
    }

    const prepared = normalizedRows.map((row) => {
      const amount = safeNumber(row.amount, -1);
      const quantity = safeNumber(row.quantity, 1);
      const status = String(row.status).trim().toLowerCase();

      if (!['success', 'failed', 'refunded'].includes(status)) {
        throw new Error(`Invalid status found: ${row.status}`);
      }
      if (amount <= 0) {
        throw new Error(`Invalid amount found for product ${row.productName}`);
      }

      return {
        merchantId,
        amount: roundCurrency(amount),
        status,
        productName: String(row.productName).trim(),
        quantity: Math.max(1, Math.round(quantity)),
        createdAt: safeDate(row.date),
        source: 'csv-import',
        isDemoData: false
      };
    });

    const inserted = await Transaction.insertMany(prepared);
    return res.status(201).json({ message: 'CSV import completed successfully.', insertedCount: inserted.length });
  } catch (error) {
    return next(error);
  }
}
