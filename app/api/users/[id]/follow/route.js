import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { nextAuthConfig } from '../../../auth/[...nextauth]/route';
import User from '@/models/User';
import connectDB from '@/db/ConnectDb';
import { notifyNewFollower } from '@/utils/notificationHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Follow/Unfollow a user
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id: creatorId } = params;
    const fanId = session.user.id;

    // Prevent users from following themselves
    if (fanId === creatorId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Get both users
    const [fan, creator] = await Promise.all([
      User.findById(fanId),
      User.findById(creatorId)
    ]);

    if (!fan || !creator) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const isFollowing = fan.following?.includes(creatorId) || false;

    if (isFollowing) {
      // Unfollow: Remove from both arrays
      if (fan.following) fan.following.pull(creatorId);
      if (creator.followersArray) creator.followersArray.pull(fanId);
      // Update legacy follower count
      creator.followers = Math.max(0, creator.followers - 1);
      
      await Promise.all([fan.save(), creator.save()]);

      return NextResponse.json({
        success: true,
        action: 'unfollowed',
        message: `You unfollowed ${creator.username || creator.name}`,
        isFollowing: false,
        followerCount: creator.followersArray?.length || creator.followers || 0
      });
    } else {
      // Follow: Add to both arrays (initialize if they don't exist)
      if (!fan.following) fan.following = [];
      if (!creator.followersArray) creator.followersArray = [];
      
      fan.following.push(creatorId);
      creator.followersArray.push(fanId);
      // Update legacy follower count
      creator.followers = creator.followersArray.length;
      
      await Promise.all([fan.save(), creator.save()]);

      // Send notification to creator about new follower
      try {
        await notifyNewFollower(creatorId, fanId, fan.username || fan.name);
      } catch (notificationError) {
        console.error('Error sending follower notification:', notificationError);
        // Don't fail the follow action if notification fails
      }

      return NextResponse.json({
        success: true,
        action: 'followed',
        message: `You are now following ${creator.username || creator.name}`,
        isFollowing: true,
        followerCount: creator.followersArray.length
      });
    }

  } catch (error) {
    console.error('Error in follow/unfollow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Check if user is following another user
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id: creatorId } = params;
    const fanId = session.user.id;

    const fan = await User.findById(fanId);
    if (!fan) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isFollowing = fan.following?.includes(creatorId) || false;

    return NextResponse.json({
      success: true,
      isFollowing
    });

  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
