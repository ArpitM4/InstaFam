import { NextResponse } from 'next/server';
import Notification from '@/models/Notification';
import connectDB from '@/db/ConnectDb';
import mongoose from 'mongoose';

// Simple test endpoint without authentication
export async function POST(request) {
  try {
    await connectDB();

    const { recipientId, type, title, message } = await request.json();

    // Create valid ObjectIds for testing
    const testRecipientId = mongoose.Types.ObjectId.isValid(recipientId) 
      ? recipientId 
      : new mongoose.Types.ObjectId();
    
    const testSenderId = new mongoose.Types.ObjectId();

    // Create a test notification
    const notification = new Notification({
      recipientId: testRecipientId,
      senderId: testSenderId,
      type: type || 'system_message',
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      data: { source: 'test-api', originalRecipientId: recipientId }
    });

    await notification.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Test notification created successfully',
      notification: {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        recipientId: notification.recipientId,
        senderId: notification.senderId,
        createdAt: notification.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating test notification:', error);
    return NextResponse.json({ 
      error: 'Failed to create test notification',
      details: error.message 
    }, { status: 500 });
  }
}

// Test GET endpoint to check database connection
export async function GET() {
  try {
    await connectDB();
    
    const count = await Notification.countDocuments();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      totalNotifications: count 
    });

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error.message 
    }, { status: 500 });
  }
}
