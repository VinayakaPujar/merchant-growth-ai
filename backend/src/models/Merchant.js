import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    businessName: { type: String, required: true, trim: true },
    businessCategory: { type: String, required: true, trim: true },
    monthlyMarketingBudget: { type: Number, default: 0, min: 0 },
    isDemoAccount: { type: Boolean, default: false }
  },
  { timestamps: true }
);

merchantSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('Merchant', merchantSchema);
