'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';
import Redemption from '@/models/Redemption';
import VaultItem from '@/models/VaultItem'; // Ensure model is registered
import { getPointsByCreator } from '@/utils/pointsHelpers';

export async function fetchMyFamPoints() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Parallelize detailed data fetching
        const [pointsByCreator, recentTransactions] = await Promise.all([
            getPointsByCreator(user._id),
            PointTransaction.find({
                userId: user._id,
                $or: [
                    { used: { $ne: true } },
                    { type: 'Spent' }
                ]
            })
                .populate('creatorId', 'username name profilepic')
                .sort({ createdAt: -1 })
                .limit(20)
                .lean()
        ]);

        // Calculate total points
        const totalPoints = pointsByCreator.reduce((sum, creator) => sum + creator.points, 0);

        // Serialize data (convert ObjectIds to strings)
        const serializedPointsByCreator = pointsByCreator.map(creator => ({
            creatorId: creator.creatorId.toString(),
            creatorUsername: creator.creatorUsername,
            creatorName: creator.creatorName,
            creatorProfilePic: creator.creatorProfilePic,
            points: creator.points,
            expiringPoints: creator.expiringPoints,
            nextExpiry: creator.nextExpiry ? creator.nextExpiry.toISOString() : null
        }));

        const serializedTransactions = recentTransactions.map(tx => ({
            _id: tx._id.toString(),
            amount: tx.amount || tx.points_earned,
            type: tx.type,
            description: tx.description,
            creatorUsername: tx.creatorId?.username,
            creatorProfilePic: tx.creatorId?.profilepic,
            createdAt: tx.createdAt.toISOString(),
            expiresAt: tx.expiresAt ? tx.expiresAt.toISOString() : null,
            expired: tx.expired,
            used: tx.used
        }));

        return {
            success: true,
            data: {
                totalPoints,
                pointsByCreator: serializedPointsByCreator,
                transactions: serializedTransactions
            }
        };

    } catch (error) {
        console.error('Error fetching FamPoints:', error);
        return { success: false, error: 'Failed to fetch points' };
    }
}

export async function fetchMyRedemptions() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const redemptions = await Redemption.find({
            fanId: user._id
        })
            .populate('vaultItemId', 'title description perkType fileType pointCost fileUrl')
            .populate('creatorId', 'username')
            .sort({ redeemedAt: -1 })
            .lean();

        const serializedRedemptions = redemptions.map(r => ({
            _id: r._id.toString(),
            fanId: r.fanId.toString(),
            creatorId: r.creatorId ? {
                _id: r.creatorId._id.toString(),
                username: r.creatorId.username
            } : null,
            vaultItemId: r.vaultItemId ? {
                _id: r.vaultItemId._id.toString(),
                title: r.vaultItemId.title,
                description: r.vaultItemId.description,
                perkType: r.vaultItemId.perkType,
                fileType: r.vaultItemId.fileType,
                pointCost: r.vaultItemId.pointCost,
                fileUrl: r.vaultItemId.fileUrl
            } : null,
            redeemedAt: r.redeemedAt.toISOString(),
            status: r.status,
            fanInput: r.fanInput,
            creatorResponse: r.creatorResponse,
            answeredAt: r.answeredAt ? r.answeredAt.toISOString() : null
        }));

        return {
            success: true,
            redemptions: serializedRedemptions
        };

    } catch (error) {
        console.error('Error fetching redemptions:', error);
        return { success: false, error: 'Failed to fetch redemptions' };
    }
}
