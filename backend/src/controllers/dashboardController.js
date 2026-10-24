import Transaction from '../models/Transaction.js';
import { buildDailyRevenueMap, buildTopProducts } from '../utils/metrics.js';

export async function getDashboardMetrics(req, res, next) {
  try {
    const merchantId = req.user.id;
    const transactions = await Transaction.find({ merchantId }).sort({ createdAt: -1 }).lean();

    const successful = transactions.filter((tx) => tx.status === 'success');
    const failed = transactions.filter((tx) => tx.status === 'failed');
    const totalRevenue = successful.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const transactionCount = successful.length;
    const failedCount = failed.length;
    const totalCombined = transactionCount + failedCount;
    const successRate = totalCombined > 0 ? (transactionCount / totalCombined) * 100 : 0;
    const averageOrderValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    const revenueOverTime = buildDailyRevenueMap(successful);
    const topProducts = buildTopProducts(successful);

    const recentTransactions = transactions.slice(0, 8).map((tx) => ({
      _id: tx._id,
      date: new Date(tx.createdAt).toISOString(),
      productName: tx.productName,
      amount: Number(tx.amount || 0),
      status: tx.status,
      quantity: tx.quantity || 1
    }));

    return res.json({
      currency: 'INR',
      metricSummary: {
        totalRevenue,
        successfulTransactions: transactionCount,
        failedTransactions: failedCount,
        successRate,
        averageOrderValue,
        revenueOverTime,
        topProducts,
        recentTransactions
      }
    });
  } catch (error) {
    return next(error);
  }
}
