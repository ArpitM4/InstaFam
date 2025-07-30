import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { nextAuthConfig } from '../../auth/[...nextauth]/route';
import Notification from '@/models/Notification';
import connectDB from '@/db/ConnectDb';

// PUT - Mark notification as read
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: params.id, 
        recipientId: session.user.id 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, notification });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
