import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PointTransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    enum: ['Earned', 'Spent', 'Refund', 'Expired', 'Bonus'], 
    default: 'Earned' 
  },
  amount: { 
    type: Number, 
    required: function() {
      // Only require amount if points_earned is not set (for new transactions)
      return !this.points_earned;
    },
    validate: {
      validator: function(v) {
        // If amount is provided, it must be a valid number
        if (v !== undefined && v !== null) {
          return !isNaN(v);
        }
        // If amount is not provided, points_earned must be provided
        return this.points_earned !== undefined && this.points_earned !== null && !isNaN(this.points_earned);
      },
      message: 'Either amount or points_earned must be a valid number'
    }
  }, // Renamed from points_earned for clarity
  points_earned: { type: Number }, // Keep for backward compatibility
  source_payment_id: { type: Schema.Types.ObjectId, ref: 'Payment' }, // Link to the original payment
  redemptionId: { type: Schema.Types.ObjectId, ref: 'Redemption' }, // Link to redemption for refunds
  description: { type: String }, // e.g., "Support for creatorX" or "Refund for unfulfilled vault request"
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: function() {
      // Set expiry for 'Earned', 'Refund', and 'Bonus' type transactions
      if (this.type === 'Earned' || this.type === 'Refund' || this.type === 'Bonus' || !this.type) {
        return new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days from now
      }
      return null;
    }
  },
  expired: {
    type: Boolean,
    default: false
  },
  used: {
    type: Boolean,
    default: false
  },
  relatedTransactions: [{
    type: Schema.Types.ObjectId,
    ref: 'PointTransaction'
  }]
});

// Middleware to ensure backward compatibility and prevent NaN values
PointTransactionSchema.pre('save', function(next) {
  // Validate amount is not NaN
  if (this.amount !== undefined && (isNaN(this.amount) || this.amount === null)) {
    return next(new Error('Amount cannot be NaN or null'));
  }
  
  // Validate points_earned is not NaN
  if (this.points_earned !== undefined && (isNaN(this.points_earned) || this.points_earned === null)) {
    return next(new Error('Points earned cannot be NaN or null'));
  }

  // If amount is set but points_earned is not, set points_earned for backward compatibility
  if (this.amount !== undefined && !this.points_earned) {
    this.points_earned = this.amount;
  }
  // If points_earned is set but amount is not, set amount
  if (this.points_earned !== undefined && !this.amount) {
    this.amount = this.points_earned;
  }
  
  next();
});

// Performance indexes for faster queries
PointTransactionSchema.index({ userId: 1, type: 1, createdAt: -1 }); // User transaction history by type
PointTransactionSchema.index({ userId: 1, used: 1, expired: 1 }); // Available points calculation
PointTransactionSchema.index({ expiresAt: 1, expired: 1 }); // Expiry processing job
PointTransactionSchema.index({ createdAt: -1 }); // Recent transactions

// Force model recreation by deleting existing cached model
if (mongoose.models.PointTransaction) {
  delete mongoose.models.PointTransaction;
}

export default model("PointTransaction", PointTransactionSchema);
