// Script to fix the username index to allow null values
const mongoose = require('mongoose');
const path = require('path');

// Import the connection function
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://arpitmalviya414:vD53nKP3oN7j1Wuw@instafam.g93qq.mongodb.net/test?retryWrites=true&w=majority&appName=instafam');
    console.log('MongoDB Connected:', mongoose.connection.host);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

async function fixUsernameIndex() {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    console.log('Checking existing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));
    
    // Drop the old username index if it exists
    try {
      await collection.dropIndex('username_1');
      console.log('✅ Dropped old username_1 index');
    } catch (error) {
      console.log('ℹ️ username_1 index not found or already dropped');
    }
    
    // Create new index that allows null values
    await collection.createIndex(
      { username: 1 }, 
      { 
        unique: true, 
        sparse: true, 
        partialFilterExpression: { 
          username: { $exists: true, $ne: null, $ne: "" } 
        },
        name: 'username_1_partial'
      }
    );
    
    console.log('✅ Created new username index that allows null values');
    
    // Verify the new index
    const newIndexes = await collection.indexes();
    console.log('New indexes:', newIndexes.map(idx => ({ name: idx.name, key: idx.key })));
    
  } catch (error) {
    console.error('❌ Error fixing username index:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

fixUsernameIndex();
