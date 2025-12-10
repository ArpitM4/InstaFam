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

            // Decrement unlockCount on the VaultItem (free up the slot)
            await VaultItem.findByIdAndUpdate(redemption.vaultItemId._id, {
                $inc: { unlockCount: -1 }
            });

            // REFUND LOGIC
            // Create Refund Transaction to restore points
            await PointTransaction.create({
                userId: redemption.fanId,
                creatorId: redemption.creatorId,
                amount: redemption.pointsSpent,
                type: 'Refund',
                redemptionId: redemption._id,
                description: `Refund for rejected vault item: ${redemption.vaultItemId.title}`
            });
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true, request: redemption });

    } catch (error) {
        console.error('Error managing request:', error);
        return NextResponse.json({ error: 'Failed to manage request' }, { status: 500 });
    }
}
