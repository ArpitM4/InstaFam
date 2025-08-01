import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { nextAuthConfig } from '../auth/[...nextauth]/route';
import Notification from '@/models/Notification';
import connectDB from '@/db/ConnectDb';

// GET - Fetch user's notifications
export async function GET(request) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const query = { recipientId: session.user.id };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('senderId', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const unreadCount = await Notification.countDocuments({
      recipientId: session.user.id,
      isRead: false
    });

    const totalCount = await Notification.countDocuments({ recipientId: session.user.id });

    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === limit,
      totalCount
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST - Create a new notification (for system use)
export async function POST(request) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { recipientId, type, title, message, data } = await request.json();

    const notification = new Notification({
      recipientId,
      senderId: session.user.id,
      type,
      title,
      message,
      data
    });

    await notification.save();

    return NextResponse.json({ success: true, notification });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
