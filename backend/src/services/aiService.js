import { GoogleGenerativeAI } from '@google/generative-ai';

function fallbackInsights(data) {
  const topProduct = data.topProducts?.[0];
  const averageDailyRevenue = data.revenueOverTime?.length
    ? data.revenueOverTime.reduce((sum, item) => sum + Number(item.revenue || 0), 0) / data.revenueOverTime.length
    : 0;

  const periods = data.weakPeriods?.length ? data.weakPeriods : []; 

  const recommendation = topProduct
    ? `Focus marketing spend on ${topProduct.name}. It currently contributes the highest revenue and can support bundles or cart additions.`
    : 'Add more sales records to identify a clear best-selling product.';

  return {
    summary: 'This dashboard overview reflects actual transaction data from your business records.',
    keyFindings: [
      {
        title: 'Top-performing product',
        description: topProduct ? `${topProduct.name} contributes ₹${topProduct.revenue.toLocaleString('en-IN')} in successful sales.` : 'No successful sales were found in the current data set.',
        supportingData: topProduct ? [{ label: 'Product revenue', value: `₹${topProduct.revenue.toLocaleString('en-IN')}` }] : []
      },
      {
        title: 'Weak periods',
        description: periods.length ? `Lower-revenue periods were observed on ${periods.map((p) => p.date).join(', ')}.` : 'No clear weak periods were detected from the available sales history.',
        supportingData: periods.length ? periods.slice(0, 2).map((p) => ({ label: p.date, value: `₹${p.revenue.toLocaleString('en-IN')}` })) : []
      }
    ],
    recommendations: [
      recommendation,
      'Review failed payment spikes and transaction volume during lower-performing days before changing pricing or discount strategy.',
      'Monitor revenue per day to verify whether a promotion lifts conversion without overspending.'
    ],
    source: 'demo-fallback',
    supportingData: {
      totalSuccessfulRevenue: data.totalSuccessfulRevenue || 0,
      transactionCount: data.transactionCount || 0,
      averageDailyRevenue: averageDailyRevenue,
      topProducts: data.topProducts || []
    }
  };
}

function isValidInsightsPayload(data) {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.keyFindings) || !Array.isArray(data.recommendations)) return false;
  return true;
}

export async function generateBusinessInsights(rawSummary) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackInsights(rawSummary);
  }

  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      You are a merchant growth analyst. Use only the supplied data and do not invent figures or claim a guaranteed revenue lift.
      Business context: ${JSON.stringify(rawSummary)}

      Return valid JSON only with this structure:
      {
        "summary": "brief summary in plain English",
        "keyFindings": [{ "title": "string", "description": "string", "supportingData": [{ "label": "string", "value": "string" }] }],
        "recommendations": ["string"],
        "source": "live-ai-model"
      }

      Rules:
      - Do not fabricate any data or metrics.
      - If there is insufficient information, say so and keep recommendations practical.
      - Explain which data supports each insight.
      - Keep the output concise and business-focused.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.trim();
    const parsed = JSON.parse(cleaned);

    if (!isValidInsightsPayload(parsed)) {
      throw new Error('AI response did not include the expected structure.');
    }

    return {
      ...parsed,
      source: 'live-ai-model',
      supportingData: rawSummary
    };
  } catch (error) {
    return fallbackInsights(rawSummary);
  }
}

export async function generateChatReply({ message, summary }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      answer: 'Gemini API is not configured. Based on the available merchant data, the answer is: ' + buildFallbackChatAnswer(message, summary),
      source: 'demo-fallback'
    };
  }

  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      You are an AI merchant growth assistant.
      Merchant sales summary: ${JSON.stringify(summary)}
      User question: ${message}

      Respond in plain English. If the data is insufficient, say so clearly. Do not claim guaranteed results. Cite the data that supports the answer. Use concise but helpful business language.
    `;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return { answer, source: 'live-ai-model' };
  } catch (error) {
    return {
      answer: 'The live AI model is unavailable right now. Based on the available records, ' + buildFallbackChatAnswer(message, summary),
      source: 'demo-fallback'
    };
  }
}

function buildFallbackChatAnswer(message, summary) {
  const lower = (message || '').toLowerCase();
  const successRevenue = summary.totalSuccessfulRevenue || 0;
  const topProduct = summary.topProducts?.[0];
  const failed = summary.failedTransactions || 0;

  if (lower.includes('decrease') || lower.includes('drop')) {
    return 'sales may have decreased because the most recent records show lower daily revenue than earlier periods. Review failed payment activity and lower-performing products before adjusting campaigns.';
  }

  if (lower.includes('revenue') || lower.includes('product')) {
    return topProduct
      ? `the highest revenue product is ${topProduct.name}, contributing ₹${topProduct.revenue.toLocaleString('en-IN')} in successful sales.`
      : 'there is not enough successful sales data yet to identify a leader.';
  }

  if (lower.includes('failed')) {
    return `${failed} failed transactions were detected. Review failed payment reasons, checkout error rates, and payment-method trends before increasing spend.`;
  }

  if (lower.includes('investigate') || lower.includes('week')) {
    return `this week, investigate product demand, failed payment trends, and daily revenue variance using the current business summary where total successful revenue is ₹${successRevenue.toLocaleString('en-IN')}.`;
  }

  return 'the current business summary supports practical review of product revenue, failed payments, and daily sales trends. More data will improve confidence.';
}
