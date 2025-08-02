import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';

export async function POST() {
  try {
    await connectDB();

    // Remove users who:
    // 1. Have no emailVerified date (unverified)
    // 2. Have expired OTP (older than 24 hours for safety)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await User.deleteMany({
      emailVerified: null,
      $or: [
        { otpExpiry: { $lt: new Date() } }, // OTP expired
        { createdAt: { $lt: oneDayAgo } }   // Created more than 24 hours ago
      ]
    });

    return NextResponse.json({ 
      message: `Cleaned up ${result.deletedCount} expired unverified accounts`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
