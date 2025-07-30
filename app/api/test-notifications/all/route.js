import { NextResponse } from 'next/server';
import Notification from '@/models/Notification';
import connectDB from '@/db/ConnectDb';

// Debug endpoint to fetch all notifications
export async function GET() {
  try {
    await connectDB();
    
    const notifications = await Notification.find()
      .populate('senderId', 'name email')
      .populate('recipientId', 'name email username')
      .sort({ createdAt: -1 })
      .limit(20);
    
    return NextResponse.json({ 
      success: true, 
      notifications: notifications.map(n => ({
        id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        recipientId: n.recipientId,
        senderId: n.senderId,
        isRead: n.isRead,
        createdAt: n.createdAt,
        data: n.data
      }))
    });

  } catch (error) {
    console.error('Error fetching all notifications:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch notifications',
      details: error.message 
    }, { status: 500 });
  }
}
