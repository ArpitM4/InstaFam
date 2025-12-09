import mongoose from "mongoose";

const { Schema, model } = mongoose;

const redemptionSchema = new Schema({
  fanId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vaultItemId: {
    type: Schema.Types.ObjectId,
    ref: 'VaultItem',
    required: true
  },
  pointsSpent: {
    type: Number,
    required: true,
    min: 1
  },
  redeemedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Fulfilled', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  fanInput: { // The Fans response to instructions
    type: String,
    maxlength: 1000
  },
  creatorResponse: { // For QnA or fulfillment notes
    type: String,
    maxlength: 2000
  },
  rejectionReason: { // Only present if status is Rejected
    type: String,
    maxlength: 500
  },
  fulfilledAt: {
    type: Date
  },
  expiredAt: {
    type: Date // For auto-cancellation (60 days)
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
redemptionSchema.index({ fanId: 1 });
redemptionSchema.index({ creatorId: 1 });
redemptionSchema.index({ vaultItemId: 1 });
redemptionSchema.index({ fanId: 1, creatorId: 1 });

export default mongoose.models?.Redemption || model("Redemption", redemptionSchema);
