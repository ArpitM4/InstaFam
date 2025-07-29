import mongoose from "mongoose";

const { Schema, model } = mongoose;

const vaultItemSchema = new Schema({
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  pointCost: {
    type: Number,
    required: true,
    min: 1
  },
  fileUrl: {
    type: String,
    required: false // Make optional for text-based rewards
  },
  fileType: {
    type: String,
    required: true,
    enum: ['image', 'video', 'pdf', 'audio', 'document', 'text-reward']
  },
  perkType: {
    type: String,
    enum: ['DigitalFile', 'Recognition', 'Influence', 'AccessLink'],
    required: true,
    default: 'DigitalFile'
  },
  unlockCount: {
    type: Number,
    default: 0
  },
  requiresFanInput: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
vaultItemSchema.index({ creatorId: 1 });
vaultItemSchema.index({ creatorId: 1, isActive: 1 });

export default mongoose.models?.VaultItem || model("VaultItem", vaultItemSchema);
