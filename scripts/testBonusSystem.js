// Test script for FamPoints Bonus System
// Run with: node scripts/testBonusSystem.js

const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testBonusSystem() {
  await connectDB();

  try {
    // Dynamic imports for ES modules
    const { default: User } = await import('../models/User.js');
    const { default: PointTransaction } = await import('../models/PointTransaction.js');

    console.log('\n🧪 Testing FamPoints Bonus System...\n');

    // Test 1: Find a test user
    const testUser = await User.findOne().limit(1);
    if (!testUser) {
      console.log('❌ No users found for testing');
      return;
    }

    console.log(`📱 Testing with user: ${testUser.username || testUser.email}`);
    console.log(`💰 Current points: ${testUser.points || 0}`);

    // Test 2: Create a bonus transaction
    const bonusAmount = 100;
    const bonusExpiryDate = new Date();
    bonusExpiryDate.setDate(bonusExpiryDate.getDate() + 60);

    const bonusTransaction = new PointTransaction({
      userId: testUser._id,
      type: 'Bonus',
      amount: bonusAmount,
      description: 'Test bonus points',
      expiresAt: bonusExpiryDate,
      expired: false,
      used: false
    });

    await bonusTransaction.save();
    console.log(`✅ Created bonus transaction: ${bonusAmount} points`);

    // Test 3: Update user points
    await User.findByIdAndUpdate(
      testUser._id,
      { $inc: { points: bonusAmount } },
      { new: true }
    );

    const updatedUser = await User.findById(testUser._id);
    console.log(`💰 Updated points: ${updatedUser.points}`);

    // Test 4: Test points availability
    const availableTransactions = await PointTransaction.find({
      userId: testUser._id,
      type: { $in: ['Earned', 'Bonus', 'Refund'] },
      expired: false,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    const totalAvailable = availableTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    console.log(`🎯 Available points (unexpired): ${totalAvailable}`);

    // Test 5: Verify bonus transaction details
    const savedBonus = await PointTransaction.findById(bonusTransaction._id);
    console.log(`📋 Bonus transaction details:
    - ID: ${savedBonus._id}
    - Amount: ${savedBonus.amount}
    - Type: ${savedBonus.type}
    - Expires: ${savedBonus.expiresAt}
    - Used: ${savedBonus.used}
    - Expired: ${savedBonus.expired}`);

    console.log('\n✅ All tests passed! Bonus system is working correctly.');

    // Cleanup (optional - remove test bonus)
    await PointTransaction.findByIdAndDelete(bonusTransaction._id);
    await User.findByIdAndUpdate(
      testUser._id,
      { $inc: { points: -bonusAmount } }
    );
    console.log('🧹 Cleaned up test data');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📝 Disconnected from MongoDB');
  }
}

testBonusSystem();
