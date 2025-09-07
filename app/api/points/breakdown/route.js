import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';
import { getAvailablePoints } from '@/utils/pointsHelpers';

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

    const now = new Date();

    // Active points (unexpired and unused)
    const activePoints = await PointTransaction.find({
      userId: user._id,
      type: 'Earned',
      expired: false,
      used: false,
      expiresAt: { $gt: now }
    }).sort({ expiresAt: 1 });

    // Recently expired (last 30 days)
    const recentlyExpired = await PointTransaction.find({
      userId: user._id,
      type: 'Expired',
      createdAt: { $gt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 });

    // Points expiring in next 30 days
    const expiringPoints = await PointTransaction.find({
      userId: user._id,
      type: 'Earned',
      expired: false,
      used: false,
      expiresAt: {
        $gt: now,
        $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      }
    }).sort({ expiresAt: 1 });

    // All spent points
    const spentPoints = await PointTransaction.find({
      userId: user._id,
      type: 'Spent'
    }).sort({ createdAt: -1 });

    const totalActive = activePoints.reduce((sum, tx) => sum + (tx.amount || tx.points_earned || 0), 0);
    const totalRecentlyExpired = Math.abs(recentlyExpired.reduce((sum, tx) => sum + (tx.amount || tx.points_earned || 0), 0));
    const totalExpiring = expiringPoints.reduce((sum, tx) => sum + (tx.amount || tx.points_earned || 0), 0);
    const totalSpent = Math.abs(spentPoints.reduce((sum, tx) => sum + (tx.amount || tx.points_earned || 0), 0));

    return NextResponse.json({
      success: true,
      activePoints: activePoints.map(tx => ({
        _id: tx._id,
        amount: tx.amount || tx.points_earned || 0,
        expiresAt: tx.expiresAt,
        createdAt: tx.createdAt,
        daysUntilExpiry: Math.ceil((tx.expiresAt - now) / (1000 * 60 * 60 * 24))
      })),
      expiringPoints: expiringPoints.map(tx => ({
        _id: tx._id,
        amount: tx.amount || tx.points_earned || 0,
        expiresAt: tx.expiresAt,
        createdAt: tx.createdAt,
        daysUntilExpiry: Math.ceil((tx.expiresAt - now) / (1000 * 60 * 60 * 24))
      })),
      recentlyExpired: recentlyExpired.map(tx => ({
        _id: tx._id,
        amount: Math.abs(tx.amount || tx.points_earned || 0),
        createdAt: tx.createdAt,
        description: tx.description
      })),
      spentPoints: spentPoints.map(tx => ({
        _id: tx._id,
        amount: Math.abs(tx.amount || tx.points_earned || 0),
        createdAt: tx.createdAt,
        description: tx.description
      })),
      totals: {
        active: totalActive,
        expiring: totalExpiring,
        recentlyExpired: totalRecentlyExpired,
        spent: totalSpent,
        lifetime: totalActive + totalRecentlyExpired + totalSpent
      }
    });

  } catch (error) {
    console.error('Points breakdown API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
