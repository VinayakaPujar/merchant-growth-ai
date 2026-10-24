import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '', trim: true },
    isDemoData: { type: Boolean, default: false }
  },
  { timestamps: true }
);

productSchema.index({ merchantId: 1, name: 1 }, { unique: true });

export default mongoose.model('Product', productSchema);
