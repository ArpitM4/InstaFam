import mongoose from 'mongoose';
import connectDB from './db/ConnectDb.js';
import PointTransaction from './models/PointTransaction.js';

async function debugTransactions() {
  try {
    await connectDB();
    
    // Check transactions for test user
    const testUserId = '6881a6fda74ff3c682ed024f';
    
    console.log('=== ALL TRANSACTIONS FOR TEST USER ===');
    const allTransactions = await PointTransaction.find({ 
      userId: new mongoose.Types.ObjectId(testUserId)
    }).sort({ createdAt: -1 });
    
    allTransactions.forEach((tx, index) => {
      console.log(`${index + 1}. Transaction:`, {
        _id: tx._id.toString(),
        type: tx.type,
        amount: tx.amount,
        points_earned: tx.points_earned,
        used: tx.used,
        expired: tx.expired,
        description: tx.description,
        createdAt: tx.createdAt
      });
    });
    
    console.log('\n=== SUMMARY ===');
    console.log('Total transactions:', allTransactions.length);
    console.log('Earned:', allTransactions.filter(tx => tx.type === 'Earned').length);
    console.log('Spent:', allTransactions.filter(tx => tx.type === 'Spent').length);
    console.log('Used (internal):', allTransactions.filter(tx => tx.used === true).length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugTransactions();
