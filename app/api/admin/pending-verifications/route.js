import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ConnectDb from '@/db/ConnectDb';
import User from '@/models/User';

async function isAdminUser(email) {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !(await isAdminUser(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ConnectDb();

    // Find users with OTP generated but not verified
    const users = await User.find({
      'instagram.otp': { $exists: true, $ne: null },
      'instagram.isVerified': { $ne: true }
    })
      .select('-password -emailVerificationOTP -passwordResetOTP')
      .sort({ 'instagram.otpGeneratedAt': 1 }); // Oldest first

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Fetch pending verifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
