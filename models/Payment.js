import mongoose, { mongo } from "mongoose";
const {Schema,model} = mongoose;

const PaymentSchema = new Schema({
    from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Fan paying
    to_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Creator receiving
    oid: { type: String, required: true },
    message: { type: String },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    done: { type: Boolean, default: false }    
});



export default mongoose.models.Payment ||model("Payment",PaymentSchema)