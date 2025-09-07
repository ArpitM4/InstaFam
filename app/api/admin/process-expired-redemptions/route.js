import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import Redemption from '@/models/Redemption';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';

export async function POST() {
  try {
    await connectDB();

    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find all pending redemptions older than 30 days
    const expiredRedemptions = await Redemption.find({
      status: 'Pending',
      redeemedAt: { $lt: thirtyDaysAgo }
    }).populate('fanId', 'username famPoints').populate('vaultItemId', 'title');

    const processedResults = [];

    for (const redemption of expiredRedemptions) {
      try {
        // Update redemption status to Unfulfilled
        redemption.status = 'Unfulfilled';
        redemption.expiredAt = new Date();
        await redemption.save();

        // Refund FamPoints to the fan with proper expiry
        const fan = redemption.fanId;
        const refundAmount = Number(redemption.pointsSpent) || 0;
        
        // Update user's total points
        await User.findByIdAndUpdate(
          fan._id,
          { $inc: { points: refundAmount } },
          { new: true }
        );

        // Create refund point transaction with expiry (60 days from refund date)
        const refundExpiryDate = new Date();
        refundExpiryDate.setDate(refundExpiryDate.getDate() + 60);
        
        await PointTransaction.create({
          userId: fan._id,
          type: 'Refund',
          amount: refundAmount,
          description: `Refund for unfulfilled vault request: ${redemption.vaultItemId.title}`,
          redemptionId: redemption._id,
          expiresAt: refundExpiryDate,
          expired: false,
          used: false
        });

        processedResults.push({
          redemptionId: redemption._id,
          fanUsername: fan.username,
          pointsRefunded: redemption.pointsSpent,
          vaultItemTitle: redemption.vaultItemId.title,
          status: 'success'
        });
      } catch (error) {
        processedResults.push({
          redemptionId: redemption._id,
          status: 'error',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedResults.length} expired redemptions`,
      results: processedResults,
      totalProcessed: processedResults.filter(r => r.status === 'success').length,
      totalErrors: processedResults.filter(r => r.status === 'error').length
    });

  } catch (error) {
    console.error('Error processing expired redemptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process expired redemptions' },
      { status: 500 }
    );
  }
}
