import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { nextAuthConfig } from '../../auth/[...nextauth]/route';
import Notification from '@/models/Notification';
import connectDB from '@/db/ConnectDb';

// PUT - Mark all notifications as read
export async function PUT(request) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    await Notification.updateMany(
      { 
        recipientId: session.user.id,
        isRead: false
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}
