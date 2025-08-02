import mongoose from "mongoose";
const { Schema, model } = mongoose;

const EventSchema = new Schema({
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Event' }, // Optional with default value
  perkDescription: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  totalEarnings: { type: Number, default: 0 }, // This will be calculated
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
}, { timestamps: true });

// Index for better query performance
EventSchema.index({ creatorId: 1, startTime: -1 });
EventSchema.index({ creatorId: 1, status: 1 });

export default mongoose.models.Event || model("Event", EventSchema);
