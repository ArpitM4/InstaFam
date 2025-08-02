import { hash } from "bcryptjs";
import nodemailer from 'nodemailer';
import connectDB from "@/db/ConnectDb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    await connectDB();

    // Check for existing VERIFIED user
    const existingUser = await User.findOne({ email, emailVerified: { $ne: null } });
    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store signup data temporarily (either update existing unverified user or create temp entry)
    let tempUser = await User.findOne({ email, emailVerified: null });
    
    console.log('🔍 Signup process - existing unverified user found:', !!tempUser);
    
    if (tempUser) {
      // Update existing unverified user
      tempUser.password = await hash(password, 10);
      tempUser.emailVerificationOTP = otp;
      tempUser.otpExpiry = otpExpiry;
      
      console.log('🔄 Updating existing user with OTP:', {
        userId: tempUser._id,
        email: tempUser.email,
        otp: otp,
        otpExpiry: otpExpiry
      });
      
      // Use $set to explicitly update the fields
      const updateResult = await User.findByIdAndUpdate(
        tempUser._id,
        {
          $set: {
            password: await hash(password, 10),
            emailVerificationOTP: otp,
            otpExpiry: otpExpiry
          }
        },
        { new: true }
      );
      
      console.log('✅ Updated user with $set:', {
        userId: updateResult._id,
        storedOTP: updateResult.emailVerificationOTP,
        storedExpiry: updateResult.otpExpiry
      });
      
      tempUser = updateResult;
    } else {
      const hashedPassword = await hash(password, 10);

      console.log('🆕 Creating new user with OTP:', {
        email: email,
        otp: otp,
        otpExpiry: otpExpiry
      });

      // Create temporary unverified user without username
      tempUser = await User.create({ 
        email, 
        password: hashedPassword,
        emailVerificationOTP: otp,
        otpExpiry: otpExpiry,
        emailVerified: null // Explicitly unverified
      });
      
      console.log('✅ New user created with OTP:', {
        userId: tempUser._id,
        storedOTP: tempUser.emailVerificationOTP,
        storedExpiry: tempUser.otpExpiry
      });
    }

    // Verify the user was saved correctly by re-fetching
    const verifyUser = await User.findOne({ email });
    console.log('🔍 Verification - User re-fetched from DB:', {
      userId: verifyUser._id,
      email: verifyUser.email,
      storedOTP: verifyUser.emailVerificationOTP,
      storedExpiry: verifyUser.otpExpiry,
      emailVerified: verifyUser.emailVerified
    });

    // Send OTP email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

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
              <h1>🎉 Welcome to InstaFam!</h1>
              <p>Verify your email to complete your account setup</p>
            </div>
            <div class="content">
              <h2>Your Verification Code</h2>
              <p>Hi there! Thanks for joining InstaFam. Please use the following 6-digit code to verify your email address:</p>
              
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
                <li>💰 Earn and redeem InstaFam points</li>
                <li>🎯 Connect with your favorite creators</li>
              </ul>
            </div>
            <div class="footer">
              <p>Need help? Contact us at <a href="mailto:support@instafam.social">support@instafam.social</a></p>
              <p>© 2025 InstaFam. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verify Your InstaFam Account - OTP Code',
        html: htmlTemplate,
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the signup if email fails, user can request new OTP
    }

    return Response.json({ 
      message: "Account created successfully! Please check your email for the verification code.",
      email: email,
      otpSent: true
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
