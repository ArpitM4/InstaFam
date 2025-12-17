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
    required: false,
    trim: true,
    maxlength: 500
  },
  pointCost: {
    type: Number,
    required: true,
    min: 0  // Changed from 1 to allow free items
  },
  isFree: {
    type: Boolean,
    default: true  // Default to free to promote free items
  },
  fileUrl: {
    type: String, // Optional: only for 'file' type (image/video/pdf)
    required: false
  },
  // Type of the vault item determines the flow
  type: {
    type: String,
    required: true,
    enum: ['file', 'text', 'qna', 'promise'],
    default: 'file'
  },
  // Sub-type for 'file' reward (e.g., image, video, pdf)
  fileType: {
    type: String,
    enum: ['image', 'video', 'pdf', 'audio', 'document'],
    required: function () { return this.type === 'file'; }
  },
  // Instructions for the Fan (e.g. "Send your IG handle") - Required for Promise/QnA
  instructions: {
    type: String,
    maxlength: 500
  },
  // Total redemption slots (0 = unlimited)
  limit: {
    type: Number,
    default: 0,
    min: 0
  },
  // Max redemptions per specific user (0 = unlimited, default 1)
  userLimit: {
    type: Number,
    default: 1,
    min: 0
  },
  unlockCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
vaultItemSchema.index({ creatorId: 1 });
vaultItemSchema.index({ creatorId: 1, isActive: 1 });

export default mongoose.models?.VaultItem || model("VaultItem", vaultItemSchema);
