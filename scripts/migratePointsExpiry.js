import connectDB from '@/db/ConnectDb.js';
import PointTransaction from '@/models/PointTransaction.js';

async function migrateExistingPoints() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Find all existing earned transactions without expiry dates
    const existingTransactions = await PointTransaction.find({
      type: { $in: ['Earned', null, undefined] }, // Include null/undefined for backward compatibility
      expiresAt: { $exists: false }
    });

    console.log(`Found ${existingTransactions.length} transactions to migrate`);

    let updated = 0;
    for (const transaction of existingTransactions) {
      // Set expiry to 60 days from the creation date
      const expiryDate = new Date(transaction.createdAt);
      expiryDate.setDate(expiryDate.getDate() + 60);
      
      // Update the transaction
      await PointTransaction.findByIdAndUpdate(transaction._id, {
        $set: {
          type: 'Earned', // Ensure type is set
          expiresAt: expiryDate,
          expired: false,
          used: false
        }
      });
      
      updated++;
      if (updated % 100 === 0) {
        console.log(`Updated ${updated}/${existingTransactions.length} transactions`);
      }
    }

    console.log(`Migration completed! Updated ${updated} transactions`);
    
    // Show some statistics
    const now = new Date();
    const expiredCount = await PointTransaction.countDocuments({
      type: 'Earned',
      expiresAt: { $lt: now },
      expired: false
    });
    
    const expiringCount = await PointTransaction.countDocuments({
      type: 'Earned',
      expiresAt: { 
        $gt: now,
        $lt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      },
      expired: false,
      used: false
    });

    console.log(`\nStatistics after migration:`);
    console.log(`- Points that have already expired: ${expiredCount}`);
    console.log(`- Points expiring in next 30 days: ${expiringCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
migrateExistingPoints();
