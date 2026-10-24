import Transaction from '../models/Transaction.js';

export async function getForecast(req, res, next) {
  try {
    const merchantId = req.user.id;
    const transactions = await Transaction.find({ merchantId, status: 'success' }).sort({ createdAt: 1 }).lean();

    if (!transactions.length) {
      return res.json({
        historical: [],
        forecast: [],
        message: 'Not enough successful sales history yet to estimate a forecast.',
        confidence: 'low'
      });
    }

    const dailyMap = new Map();
    for (const tx of transactions) {
      const dateKey = new Date(tx.createdAt).toISOString().slice(0, 10);
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + Number(tx.amount || 0));
    }

    const historical = Array.from(dailyMap.entries())
      .map(([date, revenue]) => ({ date, revenue: Number(revenue.toFixed(2)) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const last7 = historical.slice(-7);
    const movingAverage = last7.length
      ? last7.reduce((sum, item) => sum + item.revenue, 0) / last7.length
      : 0;

    if (historical.length < 3) {
      return res.json({
        historical,
        forecast: [],
        message: 'At least 3 days of successful sales data are needed for a reliable moving-average forecast.',
        confidence: 'low'
      });
    }

    const forecast = [];
    const startDate = new Date();
    for (let offset = 1; offset <= 7; offset += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + offset);
      forecast.push({
        date: date.toISOString().slice(0, 10),
        estimatedRevenue: Number(Math.max(0, movingAverage).toFixed(2)),
        note: 'Estimate based on the moving-average baseline. Not a guarantee.'
      });
    }

    return res.json({
      historical,
      forecast,
      message: 'This forecast is an estimate using a simple moving-average baseline and should not be treated as a guarantee.',
      confidence: historical.length > 14 ? 'medium' : 'low'
    });
  } catch (error) {
    return next(error);
  }
}
