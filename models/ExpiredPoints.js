import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ExpiredPointsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pointsExpired: {
    type: Number,
    required: true
  },
  expiredAt: {
    type: Date,
    default: Date.now
  },
  originalTransactions: [{
    type: Schema.Types.ObjectId,
    ref: 'PointTransaction'
  }]
});

// Performance index
ExpiredPointsSchema.index({ userId: 1, creatorId: 1 });

export default mongoose.models.ExpiredPoints || model("ExpiredPoints", ExpiredPointsSchema);

