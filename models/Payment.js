import mongoose, { mongo } from "mongoose";
const {Schema,model} = mongoose;

const PaymentSchema = new Schema({
    from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Fan paying
    to_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Creator receiving
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Event during which payment was made (optional for direct payments)
    oid: { type: String, required: true },
    message: { type: String },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    done: { type: Boolean, default: false }    
});

// Performance indexes for faster queries
PaymentSchema.index({ to_user: 1, createdAt: -1 }); // Creator leaderboard queries
PaymentSchema.index({ from_user: 1, createdAt: -1 }); // User payment history
PaymentSchema.index({ eventId: 1 }); // Event-specific payments
PaymentSchema.index({ oid: 1 }); // PayPal order lookups
PaymentSchema.index({ done: 1, createdAt: -1 }); // Pending payment queries

// Clear the cached model to ensure schema updates take effect
if (mongoose.models.Payment) {
    delete mongoose.models.Payment;
}

export default model("Payment", PaymentSchema);