import AIInsight from '../models/AIInsight.js';
import Transaction from '../models/Transaction.js';
import { buildDailyRevenueMap, buildTopProducts, roundCurrency } from '../utils/metrics.js';
import { generateBusinessInsights } from '../services/aiService.js';

export async function getInsights(req, res, next) {
  try {
    const merchantId = req.user.id;
    const transactions = await Transaction.find({ merchantId }).sort({ createdAt: -1 }).lean();

    if (!transactions.length) {
      return res.json({
        summary: 'No sales history available yet.',
        insights: [],
        recommendations: ['Add a few demo transactions or import sales data to generate AI insights.'],
        source: 'demo-fallback',
        supportingData: { transactionCount: 0 }
      });
    }

    const successful = transactions.filter((tx) => tx.status === 'success');
    const revenue = successful.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const revenueOverTime = buildDailyRevenueMap(successful);
    const topProducts = buildTopProducts(successful);

    const weakPeriods = revenueOverTime
      .slice(-14)
      .map((point) => ({ date: point.date, revenue: point.revenue }))
      .filter((point) => point.revenue < (revenueOverTime.slice(-7).reduce((sum, day) => sum + day.revenue, 0) / Math.max(1, revenueOverTime.slice(-7).length)));

    const summary = {
      merchantId,
      totalSuccessfulRevenue: roundCurrency(revenue),
      transactionCount: successful.length,
      failedTransactions: transactions.filter((tx) => tx.status === 'failed').length,
      revenueOverTime,
      topProducts,
      weakPeriods: weakPeriods.slice(0, 5)
    };

    const aiResult = await generateBusinessInsights(summary);

    await AIInsight.create({
      merchantId,
      type: 'business',
      summary: aiResult.summary || 'Business insight generated.',
      fields: aiResult,
      source: aiResult.source || 'generated'
    });

    return res.json(aiResult);
  } catch (error) {
    return next(error);
  }
}
