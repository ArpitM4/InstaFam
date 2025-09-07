import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ConnectDb from '@/db/ConnectDb';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';
import { getAvailablePoints } from '@/utils/pointsHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await ConnectDb();
    
    // DEBUG MODE - Skip auth for diagnostic purposes
    const debugUser = await User.findOne({ email: 'test@gmail.com' });
    if (!debugUser) {
      return NextResponse.json({ error: 'Debug user not found' }, { status: 404 });
    }
    
    const user = debugUser;
    
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // const user = await User.findOne({ email: session.user.email });
    // if (!user) {
    //   return NextResponse.json({ error: 'User not found' }, { status: 404 });
    // }

    const now = new Date();

    // Get user's total points from user document
    const userTotalPoints = user.points || 0;

    // Get available points using our helper function
    const helperAvailablePoints = await getAvailablePoints(user._id);

    // Get all user transactions for debugging
    const allTransactions = await PointTransaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    // Manual calculation of available points
    const manualAvailableTransactions = await PointTransaction.find({
      userId: user._id,
      type: { $in: ['Earned', 'Bonus', 'Refund'] },
      expired: false,
      used: false,
      expiresAt: { $gt: now }
    });

    const manualAvailablePoints = manualAvailableTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    // Check for problematic transactions
    const problemTransactions = await PointTransaction.find({
      userId: user._id,
      $or: [
        { expired: { $exists: false } },
        { used: { $exists: false } },
        { expiresAt: { $exists: false } },
        { type: { $exists: false } }
      ]
    });

    // Count transactions by type
    const transactionCounts = await PointTransaction.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: '$type', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    return NextResponse.json({
      success: true,
      debug: {
        userTotalPoints,
        helperAvailablePoints,
        manualAvailablePoints,
        transactionCounts,
        problemTransactions: problemTransactions.length,
        recentTransactions: allTransactions.map(tx => ({
          id: tx._id,
          type: tx.type,
          amount: tx.amount,
          expired: tx.expired,
          used: tx.used,
          expiresAt: tx.expiresAt,
          createdAt: tx.createdAt,
          hasExpiredField: tx.expired !== undefined,
          hasUsedField: tx.used !== undefined,
          hasExpiresAtField: tx.expiresAt !== undefined,
          hasTypeField: tx.type !== undefined
        }))
      }
    });

  } catch (error) {
    console.error('Points diagnostic error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
