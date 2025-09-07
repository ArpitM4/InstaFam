import mongoose from 'mongoose';
import connectDB from './db/ConnectDb.js';
import PointTransaction from './models/PointTransaction.js';

async function addTestSpentTransaction() {
  try {
    await connectDB();
    
    const testUserId = '6881a6fda74ff3c682ed024f';
    
    // Create a test spent transaction
    const spentTransaction = new PointTransaction({
      userId: new mongoose.Types.ObjectId(testUserId),
      amount: -10,
      type: 'Spent',
      description: 'Test vault redemption',
      used: false,
      expired: false,
      expiresAt: null,
      createdAt: new Date()
    });
    
    await spentTransaction.save();
    console.log('Test spent transaction created:', spentTransaction._id);
    
    // Now fetch all transactions for this user to verify
    const allTransactions = await PointTransaction.find({ 
      userId: new mongoose.Types.ObjectId(testUserId)
    }).sort({ createdAt: -1 });
    
    console.log('\nAll transactions after adding spent transaction:');
    allTransactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.type}: ${tx.amount} (used: ${tx.used}, description: ${tx.description || 'none'})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addTestSpentTransaction();
