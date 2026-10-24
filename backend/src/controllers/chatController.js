import Transaction from '../models/Transaction.js';
import { generateChatReply } from '../services/aiService.js';

export async function createChatReply(req, res, next) {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'A message is required for the AI chat.' });
    }

    const merchantId = req.user.id;
    const transactions = await Transaction.find({ merchantId }).sort({ createdAt: -1 }).lean();

    const successful = transactions.filter((tx) => tx.status === 'success');
    const failed = transactions.filter((tx) => tx.status === 'failed');
    const totalRevenue = successful.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const topProducts = Object.values(
      successful.reduce((acc, tx) => {
        acc[tx.productName] = (acc[tx.productName] || 0) + Number(tx.amount || 0);
        return acc;
      }, {})
    )
      .map((revenue, index) => ({ name: Object.keys(successful.reduce((acc, tx) => {
        acc[tx.productName] = (acc[tx.productName] || 0) + Number(tx.amount || 0);
        return acc;
      }, {}))[index], revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const summary = {
      totalSuccessfulRevenue: totalRevenue,
      transactionCount: successful.length,
      failedTransactions: failed.length,
      topProducts
    };

    const reply = await generateChatReply({ message, summary });
    return res.json(reply);
  } catch (error) {
    return next(error);
  }
}
