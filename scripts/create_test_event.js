const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

async function createTestEvent() {
  // MongoDB connection string (replace with your actual connection string)
  const uri = process.env.MONGODB_URI || 'your-mongodb-connection-string';
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('instafam'); // Replace with your database name
    
    console.log('Connected to MongoDB');
    
    // Find the user first
    const user = await db.collection('users').findOne({
  email: process.env.ADMIN_EMAILS?.split(',')[1] || ''
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Found user:', user.email, 'with ID:', user._id);
    
    // Create a test event
    const testEvent = {
      creatorId: user._id,
      title: 'Test Summer Fundraiser',
      perkDescription: 'Special perks for summer event supporters',
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      totalEarnings: 0,
      status: 'completed', // Mark as completed so it appears in payment history
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const eventResult = await db.collection('events').insertOne(testEvent);
    console.log('Created test event with ID:', eventResult.insertedId);
    
    // Create a test payment for this event
    const testPayment = {
      orderID: 'TEST_' + Date.now(),
      amount: 100, // ₹100
      to_user: user._id,
      from_user: user._id, // For simplicity, self-payment
      message: 'Test payment for event',
      eventId: eventResult.insertedId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const paymentResult = await db.collection('payments').insertOne(testPayment);
    console.log('Created test payment with ID:', paymentResult.insertedId);
    
    // Update event total earnings
    await db.collection('events').updateOne(
      { _id: eventResult.insertedId },
      { $set: { totalEarnings: 100 } }
    );
    
    console.log('Updated event total earnings to ₹100');
    console.log('Test data created successfully!');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await client.close();
  }
}

createTestEvent();
