import Transaction from '../models/Transaction.js';

export function computeAnomalies(transactions) {
  const now = Date.now();
  const last3Hours = transactions.filter((tx) => now - new Date(tx.createdAt).getTime() <= 3 * 60 * 60 * 1000);
  const last7Days = transactions.filter((tx) => now - new Date(tx.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000);

  if (!last3Hours.length || !last7Days.length) {
    return { hasAnomaly: false, anomalies: [] };
  }

  const totalRecent = last3Hours.length;
  const failedRecent = last3Hours.filter((tx) => tx.status === 'failed').length;
  const recentFailureRate = totalRecent ? failedRecent / totalRecent : 0;

  const total7Day = last7Days.length;
  const failed7Day = last7Days.filter((tx) => tx.status === 'failed').length;
  const baselineFailureRate = total7Day ? failed7Day / total7Day : 0;

  const refundRecent = last3Hours.filter((tx) => tx.status === 'refunded').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const refund7Day = last7Days.filter((tx) => tx.status === 'refunded').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const avgRefundDaily = last7Days.length ? refund7Day / 7 : 0;

  const anomalies = [];

  if (baselineFailureRate > 0 && recentFailureRate > baselineFailureRate * 1.25) {
    anomalies.push({
      type: 'failure_spike',
      severity: recentFailureRate > baselineFailureRate * 1.6 ? 'high' : 'medium',
      title: 'Payment failure spike detected',
      message: `Recent failed transactions are ${(recentFailureRate / Math.max(baselineFailureRate, 0.01) * 100).toFixed(0)}% of the baseline rate.`,
      value: recentFailureRate,
      baseline: baselineFailureRate
    });
  }

  if (avgRefundDaily > 0 && refundRecent > avgRefundDaily * 1.8) {
    anomalies.push({
      type: 'refund_surge',
      severity: refundRecent > avgRefundDaily * 2.5 ? 'high' : 'medium',
      title: 'Refund surge detected',
      message: `Refund value in the last 3 hours is above the usual daily pattern by ${(refundRecent / Math.max(avgRefundDaily, 1) * 100).toFixed(0)}%.`,
      value: refundRecent,
      baseline: avgRefundDaily
    });
  }

  const recentRevenue = last3Hours.filter((tx) => tx.status === 'success').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const avgRevenuePer7Day = last7Days.filter((tx) => tx.status === 'success').length ? last7Days.filter((tx) => tx.status === 'success').reduce((sum, tx) => sum + Number(tx.amount || 0), 0) / 7 : 0;
  if (avgRevenuePer7Day > 0 && recentRevenue < avgRevenuePer7Day * 0.75) {
    anomalies.push({
      type: 'revenue_drop',
      severity: recentRevenue < avgRevenuePer7Day * 0.5 ? 'high' : 'medium',
      title: 'Revenue slowdown detected',
      message: `The last 3 hours generated less revenue than expected relative to the average daily trend.`,
      value: recentRevenue,
      baseline: avgRevenuePer7Day
    });
  }

  return {
    hasAnomaly: anomalies.length > 0,
    anomalies
  };
}

export async function getMerchantAnomalySummary(merchantId) {
  const transactions = await Transaction.find({ merchantId }).sort({ createdAt: -1 }).lean();
  return computeAnomalies(transactions);
}
