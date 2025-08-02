import { NextResponse } from "next/server";
import connectDB from "@/db/ConnectDb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
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

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user with new password and clear reset fields
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordResetOTP: null,
      passwordResetExpiry: null,
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      message: "Password reset successfully. You can now login with your new password." 
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
