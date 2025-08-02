import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';

export async function GET(req) {
  try {
    console.log('Points Test API: Starting...');
    
    // Test database connection
    await connectDB();
    console.log('Points Test API: DB connected');
    
    // Test session
    const session = await getServerSession(authOptions);
    console.log('Points Test API: Session:', !!session);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }
    
    // Test user lookup
    const user = await User.findOne({ email: session.user.email });
    console.log('Points Test API: User found:', !!user);
    
    return NextResponse.json({ 
      success: true,
      hasSession: !!session,
      hasUser: !!user,
      userPoints: user?.points || 0,
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    console.error('Points Test API Error:', error);
    return NextResponse.json({ 
      error: 'Test API Error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
