import { NextResponse } from 'next/server';
import ConnectDb from '@/db/ConnectDb';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';
import { getAvailablePoints } from '@/utils/pointsHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ConnectDb();
    
    // Find test user directly
    const user = await User.findOne({ email: 'test@gmail.com' });
    if (!user) {
      return NextResponse.json({ error: 'Test user not found' }, { status: 404 });
    }

    console.log(`\n=== POINTS DEBUG for ${user.email} ===`);
    console.log(`User ID: ${user._id}`);
    console.log(`User.points: ${user.points}`);

    // Get available points using helper function
    const helperAvailablePoints = await getAvailablePoints(user._id);
    console.log(`getAvailablePoints result: ${helperAvailablePoints}`);

    // Get all transactions for this user
    const allTransactions = await PointTransaction.find({ userId: user._id })
      .sort({ createdAt: -1 });
    
    console.log(`Total transactions: ${allTransactions.length}`);
    
    // Check for non-expired transactions manually
    const now = new Date();
    const nonExpiredTransactions = allTransactions.filter(tx => {
      const isExpired = tx.expiresAt && tx.expiresAt <= now;
      // Handle backward compatibility for points field
      const points = tx.amount || tx.points_earned || 0;
      console.log(`Transaction ${tx._id}: amount=${tx.amount}, points_earned=${tx.points_earned}, calculated=${points} points, type: ${tx.type}, expires: ${tx.expiresAt}, expired: ${isExpired}`);
      return !isExpired;
    });

    const manualAvailablePoints = nonExpiredTransactions.reduce((total, tx) => {
      const points = tx.amount || tx.points_earned || 0;
      return total + points;
    }, 0);
    console.log(`Manual calculation: ${manualAvailablePoints} points`);

    const result = {
      userId: user._id,
      userEmail: user.email,
      userTotalPoints: user.points,
      helperAvailablePoints,
      manualAvailablePoints,
      totalTransactions: allTransactions.length,
      nonExpiredTransactions: nonExpiredTransactions.length,
      discrepancy: user.points !== helperAvailablePoints,
      transactions: allTransactions.slice(0, 5).map(tx => ({
        id: tx._id,
        amount: tx.amount,
        points_earned: tx.points_earned,
        calculatedPoints: tx.amount || tx.points_earned || 0,
        type: tx.type,
        expiresAt: tx.expiresAt,
        createdAt: tx.createdAt,
        isExpired: tx.expiresAt && tx.expiresAt <= now
      }))
    };

    console.log(`=== END DEBUG ===\n`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
