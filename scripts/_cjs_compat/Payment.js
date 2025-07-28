const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const PaymentSchema = new Schema({
    name: { type: String, required: true },
    to_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    oid: { type: String, required: true },
    message: { type: String },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    done: { type: Boolean, default: false }
});

module.exports = mongoose.models.Payment || model('Payment', PaymentSchema);
