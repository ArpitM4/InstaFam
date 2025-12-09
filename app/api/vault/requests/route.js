import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '@/models/User';
import Redemption from '@/models/Redemption';
import VaultItem from '@/models/VaultItem';
import PointTransaction from '@/models/PointTransaction';
import connectDB from '@/db/ConnectDb';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch requests where this user is the CREATOR
        // status: Pending or Fulfilled or Rejected
        const requests = await Redemption.find({ creatorId: user._id })
            .populate('fanId', 'name username profilepic')
            .populate('vaultItemId', 'title type pointCost')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching vault requests:', error);
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        const data = await req.json();
        const { requestId, action, response, rejectionReason } = data; // action: 'fulfill' | 'reject'

        const redemption = await Redemption.findById(requestId).populate('vaultItemId');
        if (!redemption) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        // Verify ownership
        if (redemption.creatorId.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (action === 'fulfill') {
            redemption.status = 'Fulfilled';
            redemption.fulfilledAt = new Date();
            if (response) redemption.creatorResponse = response;
            await redemption.save();

            // Notify Fan? (Future enhancement)

        } else if (action === 'reject') {
            if (!rejectionReason) return NextResponse.json({ error: 'Rejection reason required' }, { status: 400 });

            redemption.status = 'Rejected';
            redemption.rejectionReason = rejectionReason;
            await redemption.save();

            // REFUND LOGIC
            // 1. Credit points back to Fan
            // 2. Create Refund Transaction

            // Find existing transaction to reverse? Or just create new one?
            // Let's create a new transaction record for refund

            // Update user points (Fan)
            // Need to find the specific "points balance" for this creator-fan pair?
            // Current system: User schema has `famPoints`. Is it global or per creator?
            // User.js: `points: [{ creatorId: ..., points: ... }]` ?
            // Or is it a separate collection?
            // Let's check `models/User.js` or `PointTransaction.js` usage.
            // Based on `VaultSection.js`, it calls `fetchFanData`.

            // I'll assume `PointTransaction` handles the ledger, and I need to update the aggregated balance.
            // Actually, let's look at `actions/pointsActions.js` or similar to see how points are managed.
            // For now, I will mark it as Rejected. The refund logic likely needs to interact with the Points system carefully.
            // I will add a TODO or try to implement if I see the pattern.

            // Pattern from VaultSection: `setUserPoints(prev => prev - cost)`.
            // Server side:
            const fan = await User.findById(redemption.fanId);
            if (fan) {
                // Logic to find point balance for THIS creator
                const creatorPointIndex = fan.points.findIndex(p => p.creatorId.toString() === user._id.toString());
                if (creatorPointIndex > -1) {
                    fan.points[creatorPointIndex].points += redemption.pointsSpent;
                    await fan.save();
                }

                // Create Refund Transaction
                await PointTransaction.create({
                    fanId: fan._id,
                    creatorId: user._id,
                    amount: redemption.pointsSpent,
                    type: 'REFUND',
                    description: `Refund for rejected vault item: ${redemption.vaultItemId.title}`
                });
            }
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true, request: redemption });

    } catch (error) {
        console.error('Error managing request:', error);
        return NextResponse.json({ error: 'Failed to manage request' }, { status: 500 });
    }
}
