import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { nextAuthConfig } from '../../../auth/[...nextauth]/route';
import User from '@/models/User';
import connectDB from '@/db/ConnectDb';
import { notifyFollowersNewEvent } from '@/utils/notificationHelpers';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST - Notify followers about a new event
export async function POST(request) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { creatorId, creatorName } = await request.json();

    // Verify the user is the creator
    if (session.user.id !== creatorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get the creator's followers
    const creator = await User.findById(creatorId).populate('followersArray', '_id');
    
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const followerIds = creator.followersArray.map(follower => follower._id);
    
    if (followerIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Event started but no followers to notify',
        notificationsSent: 0 
      });
    }

    // Send notifications to all followers
    const notifications = await notifyFollowersNewEvent(creatorId, creatorName, followerIds);

    return NextResponse.json({
      success: true,
      message: `Notified ${notifications.length} followers about your new event`,
      notificationsSent: notifications.length
    });

  } catch (error) {
    console.error('Error notifying followers about event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
