import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PointTransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  points_earned: { type: Number, required: true },
  source_payment_id: { type: Schema.Types.ObjectId, ref: 'Payment' }, // Link to the original payment
  description: { type: String }, // e.g., "Support for creatorX"
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PointTransaction || model("PointTransaction", PointTransactionSchema);
