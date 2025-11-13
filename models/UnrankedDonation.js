import mongoose from "mongoose";
const { Schema, model } = mongoose;

/**
 * UnrankedDonation Schema
 * This model stores all donations made when NO EVENT is active.
 * These are normal contributions without leaderboard rankings.
 * 
 * Key differences from Payment model:
 * - from_name: Can be any string (editable by donor, not tied to User account)
 * - from_user: Optional - only set if donor is logged in
 * - No eventId field (these donations are not tied to any event)
 */
const UnrankedDonationSchema = new Schema({
    from_name: { 
        type: String, 
        required: true,
        trim: true 
    }, // Donor's name (editable, can be guest name)
    from_user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }, // Optional: Fan user ID if logged in
    to_user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // Creator receiving the donation
    oid: { 
        type: String, 
        required: true,
        unique: true 
    }, // PayPal order ID
    message: { type: String }, // Optional message from donor
    amount: { 
        type: Number, 
        required: true,
        min: 0 
    }, // Donation amount in USD
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
    done: { 
        type: Boolean, 
        default: false 
    } // Payment completion status
});

// Add index for faster queries by creator
UnrankedDonationSchema.index({ to_user: 1, createdAt: -1 });

// Clear the cached model to ensure schema updates take effect
if (mongoose.models.UnrankedDonation) {
    delete mongoose.models.UnrankedDonation;
}

export default model("UnrankedDonation", UnrankedDonationSchema);
