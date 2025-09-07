import { NextResponse } from 'next/server';
import ConnectDb from '@/db/ConnectDb';
import PointTransaction from '@/models/PointTransaction';
import Redemption from '@/models/Redemption';

export async function GET() {
  try {
    await ConnectDb();

    // Get sample transactions to see the actual data structure
    const sampleTransactions = await PointTransaction.find({})
      .limit(10)
      .sort({ createdAt: -1 })
      .lean();

    // Get unique transaction types
    const transactionTypes = await PointTransaction.distinct('type');

    // Count by different criteria
    const basicCounts = await Promise.all([
      PointTransaction.countDocuments({}),
      PointTransaction.countDocuments({ type: 'Earned' }),
      PointTransaction.countDocuments({ type: 'Spent' }),
      PointTransaction.countDocuments({ type: 'Expired' }),
      PointTransaction.countDocuments({ type: { $exists: false } }),
      PointTransaction.countDocuments({ amount: { $exists: true } }),
      PointTransaction.countDocuments({ points_earned: { $exists: true } }),
      PointTransaction.countDocuments({ amount: { $lt: 0 } }),
      PointTransaction.countDocuments({ points_earned: { $lt: 0 } }),
    ]);

    // Simple aggregation test
    const totalTest = await PointTransaction.aggregate([
      { $group: { _id: null, count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    // Check for negative values (potential redemptions)
    const negativeTransactions = await PointTransaction.find({
      $or: [
        { amount: { $lt: 0 } },
        { points_earned: { $lt: 0 } }
      ]
    }).limit(5).lean();

    // Check redemptions collection
    let redemptionsData = null;
    try {
      const redemptionsCount = await Redemption.countDocuments({});
      const sampleRedemptions = await Redemption.find({}).limit(5).lean();
      redemptionsData = { count: redemptionsCount, samples: sampleRedemptions };
    } catch (error) {
      redemptionsData = { error: 'Redemption model not found or error accessing it' };
    }

    return NextResponse.json({
      sampleTransactions,
      negativeTransactions,
      transactionTypes,
      counts: {
        total: basicCounts[0],
        earned: basicCounts[1],
        spent: basicCounts[2],
        expired: basicCounts[3],
        noType: basicCounts[4],
        hasAmount: basicCounts[5],
        hasPointsEarned: basicCounts[6],
        negativeAmount: basicCounts[7],
        negativePointsEarned: basicCounts[8]
      },
      aggregationTest: totalTest,
      redemptionsData
    });

  } catch (error) {
    console.error('Debug FamPoints error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: error.message },
      { status: 500 }
    );
  }
}
