import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Date, default: null }, // NextAuth will populate this when user verifies email
  emailVerificationOTP: { type: String, default: null }, // For OTP verification
  otpExpiry: { type: Date, default: null }, // OTP expiration time
  passwordResetOTP: { type: String, default: null }, // For password reset OTP
  passwordResetExpiry: { type: Date, default: null }, // Password reset OTP expiration time
  username: { type: String, required: false, default: null },
  password: { type: String },
  name: { type: String },
  profilepic: { type: String, default: "https://picsum.photos/200" },
  coverpic: { type: String, default: "https://picsum.photos/1600/400" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  followers: { type: Number, default: 0 }, // Legacy count field - kept for backward compatibility
  // New follow relationship arrays
  followersArray: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  accountType: {
    type: String,
    enum: ["User", "Creator", "VCreator"],
    default: "User",
  },
  paymentInfo: {
    phone: String,
    upi: String,
  },
  instagram: {
    otp: String,
    otpGeneratedAt: Date,
    isVerified: { type: Boolean, default: false },
  },
  description: { type: String, default: "Welcome to my Instafam" },
  leaderboard: {
    isActive: Boolean,
    startTime: Date,
    durationHours: Number,
  },
  perk: { type: String, default: "" },
  perkRank: { type: Number, default: 5 }, // Number of top donors for perk eligibility
  eventStart: { type: Date, default: null },
  eventEnd: { type: Date, default: null },
  points: { type: Number, default: 0 },
  vaultEarningsBalance: { type: Number, default: 0 },
  isReal: { type: Boolean, default: true },
  
  // Creator Onboarding System
  creatorOnboarding: {
    discountCode: { type: String, default: null }, // Stores claimed discount codes
    onboardingCompleted: { type: Boolean, default: false },
    checklist: {
      isVerified: { type: Boolean, default: false },
      paymentDetailsAdded: { type: Boolean, default: false },
      profilePageCreated: { type: Boolean, default: false },
      firstEventStarted: { type: Boolean, default: false },
      firstVaultItemAdded: { type: Boolean, default: false }
    },
    onboardingStartedAt: { type: Date, default: null },
    onboardingCompletedAt: { type: Date, default: null }
  },

  // Social Media Links - Array of social media profiles
  socials: [{
    platform: { type: String, required: true }, // e.g., "Instagram", "Twitter", "YouTube"
    username: { type: String, required: true }, // e.g., "@username"
    link: { type: String, required: true }, // Full URL to the profile
    createdAt: { type: Date, default: Date.now }
  }],

  // Favourite Products/Affiliates - Array of affiliated products
  favourites: [{
    name: { type: String, required: true }, // Product/Affiliate name
    link: { type: String, required: true }, // Affiliate/Product link
    image: { type: String }, // Product image URL
    createdAt: { type: Date, default: Date.now }
  }]
});

// Remove the old index definition - we'll handle this differently
// UserSchema.index({ username: 1 }, { unique: true, sparse: true, partialFilterExpression: { username: { $exists: true, $ne: null, $ne: "" } } });

// Clear any existing model to force recreation
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default model("User", UserSchema);