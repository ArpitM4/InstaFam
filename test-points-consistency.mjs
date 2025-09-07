import mongoose from 'mongoose';
import User from './models/User.js';
import PointTransaction from './models/PointTransaction.js';
import { getAvailablePoints, syncUserPoints } from './utils/pointsHelpers.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/instafam');

async function testPointsConsistency() {
  try {
    console.log('🔍 Testing Points Consistency Across System...\n');

    // Get all users with points
    const users = await User.find({ points: { $gt: 0 } }).limit(10);
    
    console.log(`Found ${users.length} users with points to test\n`);

    let inconsistentUsers = 0;
    let consistentUsers = 0;

    for (const user of users) {
      console.log(`\n👤 Testing user: ${user.username} (${user.email})`);
      console.log(`📊 Current user.points field: ${user.points}`);

      // Calculate actual available points using the utility function
      const actualAvailablePoints = await getAvailablePoints(user._id);
      console.log(`✅ Calculated available points: ${actualAvailablePoints}`);

      // Check if they match
      if (user.points === actualAvailablePoints) {
        console.log(`✅ CONSISTENT: User points match calculated points`);
        consistentUsers++;
      } else {
        console.log(`❌ INCONSISTENT: User points (${user.points}) != Calculated points (${actualAvailablePoints})`);
        inconsistentUsers++;

        // Sync the user points
        console.log(`🔄 Syncing user points...`);
        const syncedUser = await syncUserPoints(user._id);
        console.log(`✅ Synced! New user.points: ${syncedUser.points}`);
      }

      // Show recent transactions for context
      const recentTransactions = await PointTransaction.find({ 
        userId: user._id 
      }).sort({ createdAt: -1 }).limit(3);
      
      console.log(`📋 Recent transactions:`);
      recentTransactions.forEach(tx => {
        const expiryStatus = tx.expiresAt && tx.expiresAt < new Date() ? 'EXPIRED' : 'ACTIVE';
        console.log(`   - ${tx.type}: ${tx.amount} points (${expiryStatus}) - ${tx.description}`);
      });
    }

    console.log(`\n📈 SUMMARY:`);
    console.log(`✅ Consistent users: ${consistentUsers}`);
    console.log(`❌ Inconsistent users: ${inconsistentUsers}`);
    console.log(`🔄 Total users checked: ${consistentUsers + inconsistentUsers}`);

    if (inconsistentUsers === 0) {
      console.log(`\n🎉 ALL USERS HAVE CONSISTENT POINTS! The system is working correctly.`);
    } else {
      console.log(`\n⚠️  Found ${inconsistentUsers} users with inconsistent points. They have been automatically synced.`);
    }

  } catch (error) {
    console.error('❌ Error testing points consistency:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testPointsConsistency();
