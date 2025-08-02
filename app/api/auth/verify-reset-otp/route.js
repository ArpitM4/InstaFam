import { NextResponse } from "next/server";
import connectDB from "@/db/ConnectDb";
import User from "@/models/User";

// Rate limiting for OTP verification attempts
const verificationAttempts = new Map();

function checkVerificationRateLimit(email) {
  const now = Date.now();
  const userAttempts = verificationAttempts.get(email) || { count: 0, lastAttempt: 0 };
  
  // Reset count if more than 15 minutes has passed
  if (now - userAttempts.lastAttempt > 15 * 60 * 1000) {
    userAttempts.count = 0;
  }
  
  // Check if user has exceeded limit (5 attempts per 15 minutes)
  if (userAttempts.count >= 5) {
    return false;
  }
  
  // Update attempts
  userAttempts.count++;
  userAttempts.lastAttempt = now;
  verificationAttempts.set(email, userAttempts);
  
  return true;
}

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (!checkVerificationRateLimit(email)) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please try again later." },
        { status: 429 }
      );
    }

    await connectDB();

    // Find user with valid reset OTP
    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetOTP: otp,
      passwordResetExpiry: { $gt: new Date() },
      password: { $exists: true, $ne: null }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please request a new password reset." },
        { status: 400 }
      );
    }

    // OTP is valid - return success without clearing it yet
    // (We'll clear it when password is actually reset)
    return NextResponse.json({ 
      message: "OTP verified successfully. You can now reset your password.",
      verified: true
    });

  } catch (error) {
    console.error("Verify reset OTP error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
