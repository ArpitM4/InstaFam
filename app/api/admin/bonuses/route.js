import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { nextAuthConfig } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';
import Bonus from '@/models/Bonus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Admin emails - Update this with your admin emails
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

export async function GET(req) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ message: 'Access denied. Admin only.' }, { status: 403 });
    }

    await connectDB();

    // Get all bonus requests that are in 'Requested' status
    const requestedBonuses = await Bonus.find({ status: 'Requested' })
      .populate('creatorId', 'username name email')
      .sort({ requestedAt: -1 });

    return NextResponse.json({ 
      success: true,
      bonuses: requestedBonuses 
    });

  } catch (error) {
    console.error('Error fetching bonus requests:', error);
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ message: 'Access denied. Admin only.' }, { status: 403 });
    }

    await connectDB();

    const { bonusId, bonusAmount } = await req.json();

    if (!bonusId || !bonusAmount) {
      return NextResponse.json({ message: 'Bonus ID and amount are required' }, { status: 400 });
    }

    if (bonusAmount <= 0) {
      return NextResponse.json({ message: 'Bonus amount must be positive' }, { status: 400 });
    }

    // Find the bonus record
    const bonus = await Bonus.findById(bonusId);
    if (!bonus) {
      return NextResponse.json({ message: 'Bonus record not found' }, { status: 404 });
    }

    // Grant the bonus
    await bonus.grantBonus(bonusAmount);

    return NextResponse.json({ 
      message: 'Bonus granted successfully',
      bonus: {
        id: bonus._id,
        month: bonus.month,
        year: bonus.year,
        totalFamPointsRedeemed: bonus.totalFamPointsRedeemed,
        bonusAmount: bonus.bonusAmount,
        status: bonus.status,
        grantedAt: bonus.grantedAt
      }
    });

  } catch (error) {
    console.error('Error granting bonus:', error);
    return NextResponse.json({ 
      message: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
