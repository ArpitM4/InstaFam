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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const latest = searchParams.get('latest');
    const limit = parseInt(searchParams.get('limit') || '50');

    await ConnectDb();

    let users;

    if (latest) {
      // Get latest users by creation date
      const userLimit = parseInt(latest) || 50;
      users = await User.find({})
        .select('-password -emailVerificationOTP -passwordResetOTP')
        .limit(userLimit)
        .sort({ createdAt: -1 });
    } else if (query) {
      // Search users by query
      const searchRegex = new RegExp(query, 'i');
      
      users = await User.find({
        $or: [
          { username: searchRegex },
          { email: searchRegex },
          { name: searchRegex }
        ]
      })
      .select('-password -emailVerificationOTP -passwordResetOTP')
      .limit(limit)
      .sort({ createdAt: -1 });
    } else {
      // Default: return latest 50 users
      users = await User.find({})
        .select('-password -emailVerificationOTP -passwordResetOTP')
        .limit(50)
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
