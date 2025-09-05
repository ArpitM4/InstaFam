import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PointTransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['Earned', 'Spent', 'Refund'], 
    default: 'Earned' 
  },
  amount: { type: Number, required: true }, // Renamed from points_earned for clarity
  points_earned: { type: Number }, // Keep for backward compatibility
  source_payment_id: { type: Schema.Types.ObjectId, ref: 'Payment' }, // Link to the original payment
  redemptionId: { type: Schema.Types.ObjectId, ref: 'Redemption' }, // Link to redemption for refunds
  description: { type: String }, // e.g., "Support for creatorX" or "Refund for unfulfilled vault request"
  createdAt: { type: Date, default: Date.now },
});

// Middleware to ensure backward compatibility
PointTransactionSchema.pre('save', function(next) {
  // If amount is set but points_earned is not, set points_earned for backward compatibility
  if (this.amount && !this.points_earned) {
    this.points_earned = this.amount;
  }
  // If points_earned is set but amount is not, set amount
  if (this.points_earned && !this.amount) {
    this.amount = this.points_earned;
  }
  next();
});

export default mongoose.models.PointTransaction || model("PointTransaction", PointTransactionSchema);
