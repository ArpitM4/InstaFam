import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import Redemption from '@/models/Redemption';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the current user
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch expired redemptions for the current creator
    const expiredRedemptions = await Redemption.find({
      creatorId: currentUser._id,
      status: 'Unfulfilled'
    })
    .populate('fanId', 'username name profilePicture')
    .populate('vaultItemId', 'title type description')
    .sort({ expiredAt: -1 });

    return NextResponse.json({
      success: true,
      redemptions: expiredRedemptions
    });

  } catch (error) {
    console.error('Error fetching expired redemptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expired redemptions' },
      { status: 500 }
    );
  }
}
