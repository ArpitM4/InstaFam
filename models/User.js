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
  profilepic: { type: String },
  coverpic: { type: String },
  // Unsplash attribution for banner (for legal compliance)
  bannerAttribution: {
    photographer: { type: String },
    photographerUrl: { type: String },
    unsplashUrl: { type: String }
  },
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

  // Visibility and profile setup
  visibility: {
    type: String,
    enum: ["hidden", "public"],
    default: "hidden"
  },
  setupCompleted: {
    type: Boolean,
    default: false
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },

  description: { type: String, default: "Welcome to my Sygil" },
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
  }],

  // Visible Sections - Controls which sections appear on creator's payment page
  visibleSections: {
    type: [String],
    default: ['contribute', 'vault', 'links'],
    enum: ['contribute', 'vault', 'links', 'merchandise', 'community', 'subscription', 'courses', 'giveaway']
  }
});

// Performance indexes for faster queries
// Note: email already has unique: true which creates an index
UserSchema.index({ username: 1 }); // Fast username lookups (profile pages)
UserSchema.index({ accountType: 1 }); // Filter by creator/user type
UserSchema.index({ createdAt: -1 }); // Sort by newest users

// Clear any existing model to force recreation
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default model("User", UserSchema);