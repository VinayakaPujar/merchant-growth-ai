import Transaction from '../models/Transaction.js';

export async function generateOffers(req, res, next) {
  try {
    const merchantId = req.user.id;
    const { budget, focus } = req.body;
    const parsedBudget = Number(budget);

    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      return res.status(400).json({ message: 'A valid campaign budget greater than zero is required.' });
    }

    const transactions = await Transaction.find({ merchantId, status: 'success' }).sort({ createdAt: -1 }).lean();
    const productMap = {};
    for (const tx of transactions) {
      productMap[tx.productName] = (productMap[tx.productName] || 0) + Number(tx.amount || 0);
    }

    const topProduct = Object.entries(productMap).sort((a, b) => b[1] - a[1])[0];
    const topProductName = topProduct ? topProduct[0] : 'core product line';

    const offerTemplates = [
      {
        name: 'Weekend Conversion Boost',
        targetSegment: focus || 'repeat shoppers',
        suggestedSpend: Number((parsedBudget * 0.35).toFixed(2)),
        reason: `A strong performance signal exists in ${topProductName}, so a short, time-bound offer can help convert demand into higher order volume.`,
        successMetric: 'Conversion uplift and repeat purchase rate',
        risk: 'If the product mix is weak, the offer may reduce average margin.'
      },
      {
        name: 'Bundle Add-On Offer',
        targetSegment: 'basket expansion',
        suggestedSpend: Number((parsedBudget * 0.25).toFixed(2)),
        reason: `Bundle offers around ${topProductName} can improve average order values without dramatically increasing acquisition cost.`,
        successMetric: 'Average order value and bundle conversion',
        risk: 'Assumes customers respond to complementary upsells, and margin should be monitored.'
      },
      {
        name: 'Retention Reminder Push',
        targetSegment: 'returning customers',
        suggestedSpend: Number((parsedBudget * 0.2).toFixed(2)),
        reason: 'Returning customers are often cheaper to convert than new acquisition, making retention-focused offers efficient.',
        successMetric: 'Repeat-purchase rate and customer retention',
        risk: 'Requires a valid customer list and a clean segmentation strategy.'
      }
    ];

    const totalPlannedSpend = offerTemplates.reduce((sum, offer) => sum + offer.suggestedSpend, 0);
    const finalOffers = totalPlannedSpend > parsedBudget
      ? offerTemplates.map((offer) => ({ ...offer, suggestedSpend: Number(((offer.suggestedSpend / totalPlannedSpend) * parsedBudget).toFixed(2)) }))
      : offerTemplates;

    const finalTotal = finalOffers.reduce((sum, offer) => sum + offer.suggestedSpend, 0);

    return res.json({
      budget: parsedBudget,
      totalPlannedSpend: Number(finalTotal.toFixed(2)),
      remainingBudget: Number((parsedBudget - finalTotal).toFixed(2)),
      topProduct: topProductName,
      offers: finalOffers,
      validation: {
        withinBudget: finalTotal <= parsedBudget,
        message: 'The backend validates that the recommended allocation does not exceed the budget.'
      }
    });
  } catch (error) {
    return next(error);
  }
}
