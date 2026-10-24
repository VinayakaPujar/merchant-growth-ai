import mongoose from 'mongoose';

const insightSchema = new mongoose.Schema(
  {
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true, index: true },
    type: { type: String, default: 'business' },
    summary: { type: String, required: true },
    fields: { type: Object, default: {} },
    source: { type: String, default: 'system' }
  },
  { timestamps: true }
);

export default mongoose.model('AIInsight', insightSchema);
