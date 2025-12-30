import { NextResponse } from "next/server";
import connectDB from "@/db/ConnectDb";
import User from "@/models/User";
import nodemailer from "nodemailer";

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map();

function checkRateLimit(email) {
  const now = Date.now();
  const userAttempts = rateLimitMap.get(email) || { count: 0, lastAttempt: 0 };

  // Reset count if more than 1 hour has passed
  if (now - userAttempts.lastAttempt > 60 * 60 * 1000) {
    userAttempts.count = 0;
  }

  // Check if user has exceeded limit (3 attempts per hour)
  if (userAttempts.count >= 3) {
    return false;
  }

  // Update attempts
  userAttempts.count++;
  userAttempts.lastAttempt = now;
  rateLimitMap.set(email, userAttempts);

  return true;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    await connectDB();

    // Find user with email and password (exclude OAuth-only users)
    const user = await User.findOne({
      email: email.toLowerCase(),
      password: { $exists: true, $ne: null }
    });

    // Always return success message for security (don't reveal if email exists)
    const successMessage = "If your email exists in our system, you will receive a password reset code.";

    if (!user) {
      return NextResponse.json({
        message: successMessage
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json({
        error: "Please verify your email address first before resetting your password."
      }, { status: 400 });
    }

    // Generate OTP and set expiry
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with reset OTP
    await User.findByIdAndUpdate(user._id, {
      passwordResetOTP: otp,
      passwordResetExpiry: otpExpiry,
      updatedAt: new Date()
    });

    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_SERVER_USER,
      to: email,
      subject: "Reset Your Sygil Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Sygil</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #666; line-height: 1.6;">
              You requested to reset your password. Use the following OTP to reset your password:
            </p>
            <div style="background: white; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; border-left: 4px solid #667eea;">
              <h1 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
              <p style="color: #999; margin: 10px 0 0 0;">This OTP will expire in 10 minutes</p>
            </div>
            <p style="color: #666; line-height: 1.6;">
              If you didn't request this password reset, please ignore this email. Your account remains secure.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    // Create transporter inside function to read env vars at runtime (not build time)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: successMessage
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
