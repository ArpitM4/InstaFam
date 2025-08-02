import connectDB from '@/db/ConnectDb';
import Event from '@/models/Event';
import Payment from '@/models/Payment';

export async function POST(request) {
  try {
    await connectDB();
    
    console.log('Cleaning up test data...');
    
    // Delete test events (those with "Test" in the title or perkDescription)
    const deletedEvents = await Event.deleteMany({
      $or: [
        { title: /test/i },
        { perkDescription: /test/i },
        { title: 'Test Summer Fundraiser' }
      ]
    });
    
    // Delete test payments (those with "TEST" in the oid)
    const deletedPayments = await Payment.deleteMany({
      oid: /^TEST_/
    });
    
    console.log(`Deleted ${deletedEvents.deletedCount} test events`);
    console.log(`Deleted ${deletedPayments.deletedCount} test payments`);
    
    return Response.json({ 
      success: true,
      message: `Cleanup complete: ${deletedEvents.deletedCount} events and ${deletedPayments.deletedCount} payments deleted`
    });
    
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    return Response.json({ error: 'Failed to cleanup test data: ' + error.message }, { status: 500 });
  }
}
