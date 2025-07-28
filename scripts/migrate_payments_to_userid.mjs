import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import connectDb from '../middleware/mongoose.js';

dotenv.config({ path: '.env.local' });

async function migrateFullPayments() {
  await connectDb();
  console.log('✅ Connected to Database.');

  const paymentsToMigrate = await Payment.find({ from_user: { $exists: false } }).lean();

  if (paymentsToMigrate.length === 0) {
    console.log('✅ No payments to migrate. Database is already up-to-date.');
    mongoose.connection.close();
    return;
  }

  console.log(`🔎 Found ${paymentsToMigrate.length} payments to migrate.`);

  let migrated = 0;
  let errors = 0;

  for (const payment of paymentsToMigrate) {
    try {
      if (!payment.name || !payment.to_user || typeof payment.name !== 'string' || typeof payment.to_user !== 'string') {
        errors++;
        console.error(`❌ SKIPPING: Payment ${payment._id} has missing or invalid name/to_user fields.`);
        continue;
      }

      const [fanUser, creatorUser] = await Promise.all([
        User.findOne({ username: payment.name }).lean(),
        User.findOne({ username: payment.to_user }).lean()
      ]);

      if (fanUser && creatorUser) {
        await Payment.updateOne(
          { _id: payment._id },
          {
            $set: {
              to_user: creatorUser._id,
              from_user: fanUser._id
            },
            $unset: { name: "" }
          }
        );
        migrated++;
        console.log(`👍 Migrated payment ${payment._id}: Fan: ${fanUser._id}, Creator: ${creatorUser._id}`);
      } else {
        errors++;
        if (!fanUser) console.error(`❌ ERROR: Fan user not found for username: "${payment.name}" (Payment ID: ${payment._id})`);
        if (!creatorUser) console.error(`❌ ERROR: Creator user not found for username: "${payment.to_user}" (Payment ID: ${payment._id})`);
      }
    } catch (err) {
      errors++;
      console.error(`🔥 CRITICAL ERROR migrating payment ${payment._id}:`, err);
    }
  }

  console.log('\n--- MIGRATION COMPLETE ---');
  console.log(`✅ Successfully Migrated: ${migrated}`);
  console.log(`❌ Failed/Skipped: ${errors}`);

  mongoose.connection.close();
}

migrateFullPayments().catch(err => {
  console.error("🔥 Unhandled error during migration:", err);
  mongoose.connection.close();
});