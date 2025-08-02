import connectDB from '@/db/ConnectDb';
import Event from '@/models/Event';
import User from '@/models/User';
import Payment from '@/models/Payment';

export async function GET(request) {
  try {
    await connectDB();
    
    console.log('=== DATABASE DEBUG ===');
    
    // Check total counts
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    const paymentCount = await Payment.countDocuments();
    
    console.log('Total users:', userCount);
    console.log('Total events:', eventCount);
    console.log('Total payments:', paymentCount);
    
    // Find the test user
    const testUser = await User.findOne({ email: 'arpitmaurya1506@gmail.com' });
    console.log('Test user found:', testUser ? 'YES' : 'NO');
    if (testUser) {
      console.log('Test user ID:', testUser._id);
      
      // Check events for this user
      const userEvents = await Event.find({ creatorId: testUser._id });
      console.log('Events for test user:', userEvents.length);
      
      // Check payments for this user
      const userPayments = await Payment.find({ to_user: testUser._id });
      console.log('Payments to test user:', userPayments.length);
      
      if (userEvents.length > 0) {
        console.log('First event:', {
          id: userEvents[0]._id,
          startTime: userEvents[0].startTime,
          endTime: userEvents[0].endTime,
          status: userEvents[0].status
        });
      }
    }
    
    return Response.json({ 
      success: true,
      counts: { userCount, eventCount, paymentCount },
      testUser: testUser ? 'found' : 'not found'
    });
    
  } catch (error) {
    console.error('Error in database debug:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
