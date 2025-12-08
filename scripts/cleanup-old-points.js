/**
 * Cleanup script for old FamPoints data
 * Removes PointTransaction and ExpiredPoints records without creatorId
 * Run with: node scripts/cleanup-old-points.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanupOldPoints() {
    console.log('🧹 Starting FamPoints cleanup...\n');

    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get direct access to collections
        const db = mongoose.connection.db;
        const pointTransactionsCollection = db.collection('pointtransactions');
        const expiredPointsCollection = db.collection('expiredpoints');

        // Count old records first
        const oldTransactionsCount = await pointTransactionsCollection.countDocuments({
            creatorId: { $exists: false }
        });
        console.log(`📊 Found ${oldTransactionsCount} PointTransaction records without creatorId`);

        const oldExpiredCount = await expiredPointsCollection.countDocuments({
            creatorId: { $exists: false }
        });
        console.log(`📊 Found ${oldExpiredCount} ExpiredPoints records without creatorId\n`);

        if (oldTransactionsCount === 0 && oldExpiredCount === 0) {
            console.log('✨ No old records to clean up!');
            return;
        }

        // Delete old PointTransactions
        if (oldTransactionsCount > 0) {
            const deleteResult1 = await pointTransactionsCollection.deleteMany({
                creatorId: { $exists: false }
            });
            console.log(`🗑️  Deleted ${deleteResult1.deletedCount} old PointTransaction records`);
        }

        // Delete old ExpiredPoints
        if (oldExpiredCount > 0) {
            const deleteResult2 = await expiredPointsCollection.deleteMany({
                creatorId: { $exists: false }
            });
            console.log(`🗑️  Deleted ${deleteResult2.deletedCount} old ExpiredPoints records`);
        }

        // Also reset the User.points field to 0 for all users (since it's now deprecated)
        const usersCollection = db.collection('users');
        const updateResult = await usersCollection.updateMany(
            { points: { $gt: 0 } },
            { $set: { points: 0 } }
        );
        console.log(`\n🔄 Reset User.points to 0 for ${updateResult.modifiedCount} users`);

        console.log('\n✅ Cleanup complete! Fresh start for creator-specific points.');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

cleanupOldPoints();
