import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';
import Redemption from '@/models/Redemption';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Fetch all expired/cancelled redemptions for this creator
        const expiredRedemptions = await Redemption.find({
            creatorId: user._id,
            status: 'Cancelled'
        })
            .populate('fanId', 'username name')
            .populate('vaultItemId', 'title description type requiresFanInput pointCost')
            .sort({ expiredAt: -1, createdAt: -1 });

        return NextResponse.json({
            success: true,
            redemptions: expiredRedemptions
        });

    } catch (error) {
        console.error('Error fetching expired redemptions:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
