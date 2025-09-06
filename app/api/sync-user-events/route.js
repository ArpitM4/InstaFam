import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';
import Event from '@/models/Event';

export async function POST() {
  try {
    await connectDB();
    
    // Get the test user
  const testUser = await User.findOne({ email: process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')[1] || '' });
    
    if (!testUser) {
      return NextResponse.json({
        success: false,
        error: 'Test user not found'
      });
    }
    
    // Find the active event for this user
    const activeEvent = await Event.findOne({ 
      creatorId: testUser._id, 
      status: 'active' 
    });
    
    if (!activeEvent) {
      return NextResponse.json({
        success: false,
        error: 'No active event found'
      });
    }
    
    console.log('=== SYNCING USER AND EVENT ===');
    console.log('Active event found:', activeEvent._id);
    console.log('Event start time:', activeEvent.startTime);
    console.log('Event end time:', activeEvent.endTime);
    
    // Update the user model to match the active event
    testUser.eventStart = activeEvent.startTime;
    testUser.eventEnd = activeEvent.endTime;
    await testUser.save();
    
    console.log('User updated with event times');
    
    return NextResponse.json({
      success: true,
      message: 'User event fields synced with active event',
      userUpdated: {
        eventStart: testUser.eventStart,
        eventEnd: testUser.eventEnd
      },
      activeEvent: {
        id: activeEvent._id.toString(),
        startTime: activeEvent.startTime,
        endTime: activeEvent.endTime,
        status: activeEvent.status
      }
    });
  } catch (error) {
    console.error('Error syncing user event fields:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
