import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ConnectDb from '@/db/ConnectDb';
import User from '@/models/User';

async function isAdminUser(email) {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdminUser(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;

    await ConnectDb();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the user
    user.instagram.isVerified = true;
    user.instagram.otp = null; // Clear OTP after verification
    user.updatedAt = new Date();
    
    await user.save();

    return NextResponse.json({ message: 'User verified successfully' });
  } catch (error) {
    console.error('Verify user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
