import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ['success', 'failed', 'refunded'] },
    productName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    createdAt: { type: Date, default: Date.now },
    source: { type: String, default: 'manual' },
    isDemoData: { type: Boolean, default: false }
  },
  { timestamps: true }
);

transactionSchema.index({ merchantId: 1, createdAt: -1 });
transactionSchema.index({ merchantId: 1, status: 1 });

export default mongoose.model('Transaction', transactionSchema);
