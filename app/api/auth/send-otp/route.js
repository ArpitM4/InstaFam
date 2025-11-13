import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    // Check if user exists (either verified or unverified)
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please sign up first.' }, { status: 404 });
    }

    // Don't send OTP to already verified users
    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified. Please login instead.' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    console.log('🔄 Before saving OTP:', {
      userId: user._id,
      email: user.email,
      otp: otp,
      otpExpiry: otpExpiry
    });
    
    // Use findByIdAndUpdate with $set to ensure the fields are saved
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          emailVerificationOTP: otp,
          otpExpiry: otpExpiry
        }
      },
      { new: true }
    );
    
    console.log('✅ After saving OTP with $set:', {
      userId: updatedUser._id,
      storedOTP: updatedUser.emailVerificationOTP,
      storedExpiry: updatedUser.otpExpiry
    });

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Email template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: monospace; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Sygil!</h1>
            <p>Verify your email to complete your account setup</p>
          </div>
          <div class="content">
            <h2>Your Verification Code</h2>
            <p>Hi there! Thanks for joining Sygil. Please use the following 6-digit code to verify your email address:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This code will expire in <strong>10 minutes</strong></li>
              <li>Don't share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
            
            <p>Once verified, you'll be able to:</p>
            <ul>
              <li>✨ Create and participate in events</li>
              <li>💰 Earn and redeem Sygil points</li>
              <li>🎯 Connect with your favorite creators</li>
            </ul>
          </div>
          <div class="footer">
            <p>Need help? Contact us at <a href="mailto:support@sygil.app">support@sygil.app</a></p>
            <p>© 2025 Sygil. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Sygil Account - OTP Code',
      html: htmlTemplate,
    });

    return NextResponse.json({ 
      message: 'OTP sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
