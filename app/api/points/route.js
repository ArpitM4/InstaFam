import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';
import { getPointsByCreator, getAvailablePoints } from '@/utils/pointsHelpers';

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
    const creatorId = searchParams.get('creatorId');
    const now = new Date();

    // If creatorId is provided, return points for that specific creator
    if (creatorId) {
      const availablePoints = await getAvailablePoints(user._id, creatorId);

      // Get transactions for this creator
      const transactions = await PointTransaction.find({
        userId: user._id,
        creatorId: creatorId,
        $or: [
          { used: { $ne: true } },
          { type: 'Spent' }
        ]
      })
        .populate('creatorId', 'username name profilepic')
        .sort({ createdAt: -1 })
        .limit(20);

      // Get expiring points for this creator
      const expiringPoints = await PointTransaction.find({
        userId: user._id,
        creatorId: creatorId,
        type: { $in: ['Earned', 'Bonus', 'Refund'] },
        expired: false,
        used: false,
        expiresAt: {
          $gt: now,
          $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        }
      }).sort({ expiresAt: 1 });

      const totalExpiring = expiringPoints.reduce((sum, tx) => sum + (tx.amount || tx.points_earned || 0), 0);

      return NextResponse.json({
        success: true,
        points: availablePoints,
        transactions: transactions.map(tx => ({
          _id: tx._id,
          amount: tx.amount || tx.points_earned,
          type: tx.type,
          description: tx.description,
          createdAt: tx.createdAt,
          expiresAt: tx.expiresAt,
          expired: tx.expired,
          used: tx.used
        })),
        expiryInfo: {
          totalExpiring,
          expiringCount: expiringPoints.length,
          nextExpiry: expiringPoints.length > 0 ? expiringPoints[0].expiresAt : null
        }
      });
    }

    // Otherwise, return points grouped by all creators
    const pointsByCreator = await getPointsByCreator(user._id);

    // Calculate total points across all creators
    const totalPoints = pointsByCreator.reduce((sum, creator) => sum + creator.points, 0);

    // Get recent transactions across all creators (for overview)
    const recentTransactions = await PointTransaction.find({
      userId: user._id,
      $or: [
        { used: { $ne: true } },
        { type: 'Spent' }
      ]
    })
      .populate('creatorId', 'username name profilepic')
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      totalPoints,
      pointsByCreator: pointsByCreator.map(creator => ({
        creatorId: creator.creatorId,
        creatorUsername: creator.creatorUsername,
        creatorName: creator.creatorName,
        creatorProfilePic: creator.creatorProfilePic,
        points: creator.points,
        expiringPoints: creator.expiringPoints,
        nextExpiry: creator.nextExpiry
      })),
      transactions: recentTransactions.map(tx => ({
        _id: tx._id,
        amount: tx.amount || tx.points_earned,
        type: tx.type,
        description: tx.description,
        creatorUsername: tx.creatorId?.username,
        creatorProfilePic: tx.creatorId?.profilepic,
        createdAt: tx.createdAt,
        expiresAt: tx.expiresAt,
        expired: tx.expired,
        used: tx.used
      }))
    });

  } catch (error) {
    console.error('Points API Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

