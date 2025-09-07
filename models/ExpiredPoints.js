import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ExpiredPointsSchema = new Schema({
  userId: {
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

export default mongoose.models.ExpiredPoints || model("ExpiredPoints", ExpiredPointsSchema);
