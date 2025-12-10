import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import Redemption from '@/models/Redemption';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';
import VaultItem from '@/models/VaultItem'; // Ensure model is loaded
import { createNotification } from '@/utils/notificationHelpers';

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
        }).populate('vaultItemId').populate('fanId', 'username');

        console.log(`[Auto-Cancel] Found ${expiredRedemptions.length} expired pending requests.`);

        const results = [];
        const creatorExpiredCounts = {}; // Track expired counts per creator

        for (const redemption of expiredRedemptions) {
            try {
                // 1. Mark as Cancelled
                redemption.status = 'Cancelled';
                redemption.expiredAt = new Date(); // Track when it effectively expired/cancelled
                redemption.rejectionReason = 'Auto-cancelled due to creator inactivity (60 days).';
                await redemption.save();

                // Track for creator notification
                const creatorId = redemption.creatorId.toString();
                if (!creatorExpiredCounts[creatorId]) {
                    creatorExpiredCounts[creatorId] = { count: 0, items: [] };
                }
                creatorExpiredCounts[creatorId].count++;
                creatorExpiredCounts[creatorId].items.push({
                    fanUsername: redemption.fanId?.username || 'Unknown',
                    vaultItemTitle: redemption.vaultItemId?.title || 'Vault Item',
                    pointsSpent: redemption.pointsSpent
                });

                // 2. Refund Points
                const fan = await User.findById(redemption.fanId);
                if (fan) {
                    const creatorPointIndex = fan.points.findIndex(p => p.creatorId.toString() === redemption.creatorId.toString());

                    if (creatorPointIndex > -1) {
                        fan.points[creatorPointIndex].points += redemption.pointsSpent;
                        await fan.save();

                        // 3. Create Transaction Record
                        await PointTransaction.create({
                            userId: fan._id,
                            creatorId: redemption.creatorId,
                            amount: redemption.pointsSpent,
                            type: 'Refund',
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

        // Send notifications to creators about expired requests
        for (const [creatorId, data] of Object.entries(creatorExpiredCounts)) {
            try {
                const totalPoints = data.items.reduce((sum, item) => sum + item.pointsSpent, 0);
                await createNotification({
                    recipientId: creatorId,
                    type: 'vault_request_expired',
                    title: `${data.count} vault request${data.count > 1 ? 's' : ''} expired`,
                    message: data.count === 1
                        ? `${data.items[0].fanUsername}'s request for "${data.items[0].vaultItemTitle}" expired after 60 days. ${data.items[0].pointsSpent} FamPoints refunded.`
                        : `${data.count} vault requests expired after 60 days. ${totalPoints} total FamPoints refunded to fans.`,
                    data: { expiredCount: data.count, totalPointsRefunded: totalPoints }
                });
            } catch (notifError) {
                console.error(`[Auto-Cancel] Error sending notification to creator ${creatorId}:`, notifError);
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

