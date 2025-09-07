const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Define schemas directly since we can't import ES modules
const PointTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['Earned', 'Spent', 'Refund', 'Expired'], 
    default: 'Earned' 
  },
  amount: { type: Number, required: true },
  points_earned: { type: Number },
  source_payment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  redemptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Redemption' },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: function() {
      if (this.type === 'Earned' || !this.type) {
        return new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      }
      return null;
    }
  },
  expired: { type: Boolean, default: false },
  used: { type: Boolean, default: false },
  relatedTransactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PointTransaction'
  }]
});

const PointTransaction = mongoose.models.PointTransaction || mongoose.model('PointTransaction', PointTransactionSchema);

async function connectDB() {
  try {
    if (mongoose.connections[0].readyState) {
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function migrateExistingPoints() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Find all existing earned transactions without expiry dates
    const existingTransactions = await PointTransaction.find({
      $or: [
        { type: { $in: ['Earned'] } },
        { type: { $exists: false } },
        { type: null }
      ],
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
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the migration
migrateExistingPoints();
