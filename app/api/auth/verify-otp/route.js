import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    console.log('🔍 OTP Verification Request:', { email, otp });

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    await connectDB();

    // Check for multiple users with same email
    const allUsers = await User.find({ email });
    console.log('🔍 All users with this email:', allUsers.length);
    
    if (allUsers.length > 1) {
      console.log('⚠️ Multiple users found with email:', allUsers.map(u => ({
        _id: u._id,
        emailVerified: u.emailVerified,
        emailVerificationOTP: u.emailVerificationOTP,
        otpExpiry: u.otpExpiry
      })));
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('� Full user data:', {
      _id: user._id,
      email: user.email,
      emailVerified: user.emailVerified,
      emailVerificationOTP: user.emailVerificationOTP,
      otpExpiry: user.otpExpiry,
      hasPassword: !!user.password,
      username: user.username
    });

    console.log('�🔑 User OTP data:', {
      storedOTP: user.emailVerificationOTP,
      otpExpiry: user.otpExpiry,
      currentTime: new Date()
    });

    // Check if OTP exists and hasn't expired
    if (!user.emailVerificationOTP || !user.otpExpiry) {
      console.log('❌ No OTP found in database');
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
    }

    if (new Date() > user.otpExpiry) {
      console.log('⏰ OTP has expired');
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Verify OTP
    console.log('🔐 OTP Comparison:', {
      userEnteredOTP: otp,
      storedOTP: user.emailVerificationOTP,
      match: user.emailVerificationOTP === otp
    });

    if (user.emailVerificationOTP !== otp) {
      console.log('❌ OTP mismatch');
      return NextResponse.json({ error: 'Invalid OTP. Please check and try again.' }, { status: 400 });
    }

    console.log('✅ OTP verified successfully');
    // Mark email as verified and clear OTP
    user.emailVerified = new Date();
    user.emailVerificationOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return NextResponse.json({ 
      message: 'Email verified successfully! You can now login.',
      verified: true 
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
