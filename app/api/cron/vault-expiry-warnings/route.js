import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import Redemption from '@/models/Redemption';
import { createNotification } from '@/utils/notificationHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Verify cron secret to prevent unauthorized access
const verifyCronSecret = (request) => {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If no secret is configured, allow access (local dev / no protection setup)
    if (!cronSecret) {
        return true;
    }

    return authHeader === `Bearer ${cronSecret}`;
};

export async function GET(request) {
    try {
        // Verify this is a legitimate cron request
        if (!verifyCronSecret(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get days parameter from query string, default to 7
        const { searchParams } = new URL(request.url);
        const daysAhead = parseInt(searchParams.get('days')) || 7;

        // Calculate cutoff: redemptions created between 53-60 days ago (expiring within next 7 days)
        const now = new Date();
        const warningCutoffMax = new Date();
        warningCutoffMax.setDate(now.getDate() - (60 - daysAhead)); // 53 days ago (will expire in 7 days)

        const warningCutoffMin = new Date();
        warningCutoffMin.setDate(now.getDate() - 60); // 60 days ago (already expired)

        console.log(`[Vault Expiry Warnings] Looking for pending redemptions created between ${warningCutoffMin.toISOString()} and ${warningCutoffMax.toISOString()}`);

        // Find all pending redemptions that will expire soon
        const expiringRedemptions = await Redemption.find({
            status: 'Pending',
            createdAt: {
                $gt: warningCutoffMin,
                $lte: warningCutoffMax
            }
        })
            .populate('fanId', 'username')
            .populate('vaultItemId', 'title');

        console.log(`[Vault Expiry Warnings] Found ${expiringRedemptions.length} expiring redemptions`);

        // Group by creator to send one notification per creator with count
        const creatorRedemptions = {};

        for (const redemption of expiringRedemptions) {
            const creatorId = redemption.creatorId.toString();
            if (!creatorRedemptions[creatorId]) {
                creatorRedemptions[creatorId] = [];
            }
            creatorRedemptions[creatorId].push({
                redemptionId: redemption._id,
                fanUsername: redemption.fanId?.username || 'Unknown',
                vaultItemTitle: redemption.vaultItemId?.title || 'Vault Item',
                createdAt: redemption.createdAt
            });
        }

        let warningsSent = 0;

        for (const [creatorId, redemptions] of Object.entries(creatorRedemptions)) {
            try {
                const count = redemptions.length;
                const daysRemaining = Math.ceil((new Date(redemptions[0].createdAt).getTime() + (60 * 24 * 60 * 60 * 1000) - now.getTime()) / (1000 * 60 * 60 * 24));

                await createNotification({
                    recipientId: creatorId,
                    type: 'vault_request_expiring_soon',
                    title: `${count} vault request${count > 1 ? 's' : ''} expiring soon!`,
                    message: count === 1
                        ? `${redemptions[0].fanUsername}'s request for "${redemptions[0].vaultItemTitle}" will auto-cancel in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Fulfill it now!`
                        : `You have ${count} pending vault requests that will auto-cancel within ${daysAhead} days. Fulfill them to avoid refunds!`,
                    data: { redemptionIds: redemptions.map(r => r.redemptionId.toString()) }
                });
                warningsSent++;
            } catch (notifError) {
                console.error(`[Vault Expiry Warnings] Error sending notification to creator ${creatorId}:`, notifError);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Vault expiry warnings sent for ${daysAhead} day window`,
            result: {
                totalRedemptions: expiringRedemptions.length,
                creatorWarningsSent: warningsSent
            }
        });

    } catch (error) {
        console.error('[Vault Expiry Warnings] Error:', error);
        return NextResponse.json(
            { error: 'Failed to send vault expiry warnings', details: error.message },
            { status: 500 }
        );
    }
}
