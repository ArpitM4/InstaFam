import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Get the test user
    const testUser = await User.findOne({ email: 'arpitmaurya1506@gmail.com' });
    
    if (!testUser) {
      return NextResponse.json({
        success: false,
        error: 'Test user not found'
      });
    }
    
    console.log('=== USER EVENT FIELDS DEBUG ===');
    console.log('User email:', testUser.email);
    console.log('User eventStart:', testUser.eventStart);
    console.log('User eventEnd:', testUser.eventEnd);
    console.log('Type of eventStart:', typeof testUser.eventStart);
    console.log('Type of eventEnd:', typeof testUser.eventEnd);
    
    return NextResponse.json({
      success: true,
      user: {
        email: testUser.email,
        username: testUser.username,
        eventStart: testUser.eventStart,
        eventEnd: testUser.eventEnd,
        eventStartType: typeof testUser.eventStart,
        eventEndType: typeof testUser.eventEnd,
        hasEventStart: !!testUser.eventStart,
        hasEventEnd: !!testUser.eventEnd
      }
    });
  } catch (error) {
    console.error('Error checking user event fields:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
