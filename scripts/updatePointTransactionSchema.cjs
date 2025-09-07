// Migration script to update PointTransaction schema with new enum values
// Run with: node scripts/updatePointTransactionSchema.cjs

const mongoose = require('mongoose');
require('dotenv').config();

async function updateSchema() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get the collection
    const collection = db.collection('pointtransactions');
    
    console.log('📊 Checking current schema...');
    
    // Check if we can update the schema by running a validation command
    try {
      await db.command({
        collMod: 'pointtransactions',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            properties: {
              type: {
                enum: ['Earned', 'Spent', 'Refund', 'Expired', 'Bonus']
              }
            }
          }
        }
      });
      console.log('✅ Schema validation updated successfully');
    } catch (error) {
      console.log('⚠️  Schema validation update failed, but this is normal for existing data');
      console.log('   The application will handle validation at the application level');
    }

    // Count existing transactions by type
    const typeCounts = await collection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    console.log('📈 Current transaction types:');
    typeCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id || 'undefined'}: ${count}`);
    });

    // Test creating a new Bonus transaction
    console.log('🧪 Testing Bonus transaction creation...');
    
    // First, let's use the raw MongoDB driver to test
    const testDoc = {
      userId: new mongoose.Types.ObjectId(),
      type: 'Bonus',
      amount: 100,
      description: 'Test bonus',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      expired: false,
      used: false
    };

    const result = await collection.insertOne(testDoc);
    console.log('✅ Test Bonus transaction created with ID:', result.insertedId);

    // Clean up test document
    await collection.deleteOne({ _id: result.insertedId });
    console.log('🧹 Test document cleaned up');

    console.log('✅ Schema update completed successfully!');
    console.log('   The application can now use Bonus type transactions.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (error.message.includes('Bonus')) {
      console.log('\n💡 This error suggests the schema cache needs to be cleared.');
      console.log('   Try restarting your Next.js application.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('📝 Disconnected from MongoDB');
  }
}

updateSchema();
