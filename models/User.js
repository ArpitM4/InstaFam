import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String }, // ✅ Add this line for email-password users
  name: { type: String },
  profilepic: { type: String },
  coverpic: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  razorpayid: { type: String },
  razorpaysecret: { type: String },
  followers: { type: Number, default: 10 },
  
  accountType: {
  type: String,
  enum: ["User", "Creator","VCreator"],
  default: "User",},

   paymentInfo: {
    phone: String,
    upi: String
  }


});

export default mongoose.models.User || model("User", UserSchema);