import mongoose from "mongoose";
const { Schema, model } = mongoose;

const DiscountCodeSchema = new Schema({
  code: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  description: { type: String, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  usageLimit: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, default: null },
  eligibilityCriteria: {
    requiresOnboardingCompletion: { type: Boolean, default: false },
    accountTypeRequired: { type: String, enum: ['Creator', 'VCreator'], default: 'Creator' }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.DiscountCode || model("DiscountCode", DiscountCodeSchema);
