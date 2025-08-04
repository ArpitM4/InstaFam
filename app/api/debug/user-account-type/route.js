import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';

export async function GET(req) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 Debug API - Session user:', session.user);

    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    console.log('🔍 Debug API - User found:', !!user);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('🔍 Debug API - User accountType:', user.accountType);

    return NextResponse.json({
      success: true,
      debug: {
        sessionUserName: session.user.name,
        sessionUserEmail: session.user.email,
        dbUserAccountType: user.accountType,
        dbUserEmail: user.email,
        dbUserName: user.name,
        dbUserUsername: user.username,
        shouldShowDashboard: user.accountType === 'Creator'
      }
    });

  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
