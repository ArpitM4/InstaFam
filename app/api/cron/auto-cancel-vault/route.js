import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import Redemption from '@/models/Redemption';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';
import VaultItem from '@/models/VaultItem'; // Ensure model is loaded

// Force dynamic since we want fresh time check on every hit
export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        // Basic authorization via secret header (for Vercel Cron or manual protection)
        // const authHeader = req.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //   // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }
        // Removing strict auth for now to allow easier testing as per user context unless specified

        await connectDB();

        // Calculate cutoff date: 60 days ago
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 60);

        // Find all REDEMPTIONS that are:
        // 1. Status is 'Pending'
        // 2. Created BEFORE the cutoff date (older than 60 days)
        const expiredRedemptions = await Redemption.find({
            status: 'Pending',
            createdAt: { $lt: cutoffDate }
        }).populate('vaultItemId');

        console.log(`[Auto-Cancel] Found ${expiredRedemptions.length} expired pending requests.`);

        const results = [];

        for (const redemption of expiredRedemptions) {
            try {
                // 1. Mark as Cancelled
                redemption.status = 'Cancelled';
                redemption.expiredAt = new Date(); // Track when it effectively expired/cancelled
                redemption.rejectionReason = 'Auto-cancelled due to creator inactivity (60 days).';
                await redemption.save();

                // 2. Refund Points
                const fan = await User.findById(redemption.fanId);
                if (fan) {
                    const creatorPointIndex = fan.points.findIndex(p => p.creatorId.toString() === redemption.creatorId.toString());

                    if (creatorPointIndex > -1) {
                        fan.points[creatorPointIndex].points += redemption.pointsSpent;
                        await fan.save();

                        // 3. Create Transaction Record
                        await PointTransaction.create({
                            fanId: fan._id,
                            creatorId: redemption.creatorId,
                            amount: redemption.pointsSpent,
                            type: 'REFUND',
                            description: `Auto-refund: Request expired (60 days) - ${redemption.vaultItemId?.title || 'Vault Item'}`
                        });

                        results.push({
                            id: redemption._id,
                            status: 'Cancelled & Refunded',
                            fan: fan.username,
                            amount: redemption.pointsSpent
                        });
                    } else {
                        results.push({ id: redemption._id, status: 'Cancelled (Fan points record missing)', fanId: redemption.fanId });
                    }
                } else {
                    results.push({ id: redemption._id, status: 'Cancelled (Fan not found)', fanId: redemption.fanId });
                }

            } catch (innerErr) {
                console.error(`[Auto-Cancel] Error processing redemption ${redemption._id}:`, innerErr);
                results.push({ id: redemption._id, status: 'Error', error: innerErr.message });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            cutoffDate: cutoffDate.toISOString(),
            details: results
        });

    } catch (error) {
        console.error('[Auto-Cancel] Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
