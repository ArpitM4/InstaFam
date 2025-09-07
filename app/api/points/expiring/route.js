import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';
import { getExpiringPoints } from '@/utils/pointsHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const daysAhead = parseInt(searchParams.get('days') || '30');

    const expiringData = await getExpiringPoints(user._id, daysAhead);

    return NextResponse.json({
      success: true,
      expiringPoints: expiringData.transactions,
      totalExpiring: expiringData.totalExpiring,
      daysAhead
    });

  } catch (error) {
    console.error('Expiring points API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
