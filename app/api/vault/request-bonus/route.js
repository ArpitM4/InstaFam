import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { nextAuthConfig } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';
import Bonus from '@/models/Bonus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user and verify they are a creator
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.accountType !== 'Creator') {
      return NextResponse.json({ message: 'Access denied. Creator account required.' }, { status: 403 });
    }

    const { month, year } = await req.json();

    if (!month || !year) {
      return NextResponse.json({ message: 'Month and year are required' }, { status: 400 });
    }

    // Find the bonus record for the specified month
    const bonus = await Bonus.findOne({
      creatorId: user._id,
      month: parseInt(month),
      year: parseInt(year)
    });

    if (!bonus) {
      return NextResponse.json({ message: 'No bonus record found for this month' }, { status: 404 });
    }

    if (bonus.totalFamPointsRedeemed === 0) {
      return NextResponse.json({ message: 'No FamPoints redeemed in this month' }, { status: 400 });
    }

    // Request the bonus
    await bonus.requestBonus();

    return NextResponse.json({ 
      message: 'Bonus requested successfully',
      bonus: {
        month: bonus.month,
        year: bonus.year,
        totalFamPointsRedeemed: bonus.totalFamPointsRedeemed,
        status: bonus.status,
        requestedAt: bonus.requestedAt
      }
    });

  } catch (error) {
    console.error('Error requesting bonus:', error);
    return NextResponse.json({ 
      message: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
