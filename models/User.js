import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String }, // ✅ Add this line for email-password users
  name: { type: String },
  profilepic: { type: String,default:"https://picsum.photos/200", },
  coverpic: { type: String,default:"https://picsum.photos/1600/400" },
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
  },
  // Inside user schema
instagram: {
  otp: String,
  otpGeneratedAt: Date,
  isVerified: { type: Boolean, default: false }
}



});

export default mongoose.models.User || model("User", UserSchema);