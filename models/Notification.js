import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Null for system notifications
  },
  type: {
    type: String,
    enum: [
      'creator_answered',        // Creator answered fan's Q&A
      'vault_redeemed',         // Fan redeemed non-digital vault item
      'redemption_fulfilled',   // Creator fulfilled a vault redemption
      'system_message',         // Admin/system message
      'payment_received',       // Payment notification

      'new_follower',          // Someone followed the user
      'creator_event_started',  // Creator started a new event (for followers)
      'creator_new_vault_item', // Creator added new vault item (for followers)

      'points_expiring_soon',   // FamPoints expiring within 7 days
      'points_expired',         // FamPoints have expired

      'vault_request_expiring_soon',  // Creator: pending redemption expiring soon (7 days warning)
      'vault_request_expired',        // Creator: pending redemption expired & refunded
      'vault_request_refunded'        // Fan: their request expired and points were refunded
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    type: Schema.Types.Mixed, // Store additional data like redemptionId, vaultItemId, etc.
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
