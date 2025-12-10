import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { nextAuthConfig } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import connectDB from '@/db/ConnectDb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Redeem Verified Badge
export async function POST(request) {
    try {
        const session = await getServerSession(nextAuthConfig);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Eligibility Checks
        if (user.accountType !== 'Creator') {
            return NextResponse.json({ error: 'Only creators can be verified' }, { status: 403 });
        }

        if (user.isVerified) {
            return NextResponse.json({ error: 'Already verified' }, { status: 400 });
        }

        const followerCount = user.followersArray?.length || user.followers || 0;

        if (followerCount < 100) {
            return NextResponse.json({ error: 'Not enough followers' }, { status: 400 });
        }

        // Grant Verification
        user.isVerified = true;
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Verification badge redeemed successfully!',
            isVerified: true
        });

    } catch (error) {
        console.error('Error redeeming verification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
