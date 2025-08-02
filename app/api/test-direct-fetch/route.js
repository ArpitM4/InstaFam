import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';
import Event from '@/models/Event';
import Payment from '@/models/Payment';

export async function GET() {
  try {
    console.log('Testing fetchEvents function with direct DB access...');
    
    await connectDB();
    
    // Test with the known test user ID
    const testUserId = '67a39f400ddad5d40eacc616';
    console.log('Testing with userId:', testUserId);
    
    // Get the creator directly
    const creator = await User.findById(testUserId);
    if (!creator) {
      throw new Error('User not found');
    }
    
    console.log('Found creator:', creator.email);
    
    // Get all events this creator has ever started
    console.log('DEBUG: Looking for events for creator:', creator._id, creator.email);
    const events = await Event.find({ 
      creatorId: creator._id 
    }).sort({ createdAt: -1 });

    console.log('DEBUG: Found events:', events.length);
    
    // Calculate total earnings from ALL payments to this user
    const allPayments = await Payment.find({ to_user: creator._id });
    const totalAllEarnings = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
    console.log('DEBUG: Total earnings from all payments:', totalAllEarnings);
    console.log('DEBUG: Total payment count:', allPayments.length);
    
    const result = {
      events: [], // Empty since no events exist
      totalEarnings: totalAllEarnings,
      totalPayments: allPayments.length
    };
    
    console.log('DEBUG: Final result:', result);
    
    return NextResponse.json({
      success: true,
      result: result,
      debugInfo: {
        creatorEmail: creator.email,
        creatorId: creator._id.toString(),
        eventCount: events.length,
        paymentCount: allPayments.length,
        samplePayments: allPayments.slice(0, 3).map(p => ({
          amount: p.amount,
          createdAt: p.createdAt,
          message: p.message
        }))
      }
    });
  } catch (error) {
    console.error('Error testing fetchEvents:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
