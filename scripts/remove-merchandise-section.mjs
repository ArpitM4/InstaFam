import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Define User schema inline to avoid import issues
const userSchema = new mongoose.Schema({
  visibleSections: [String]
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function removeMerchandiseSection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // First, let's check how many users have 'merchandise' in their visibleSections
    const usersWithMerchandise = await User.countDocuments({
      visibleSections: 'merchandise'
    });
    console.log(`Found ${usersWithMerchandise} users with 'merchandise' in visibleSections`);

    // Update all users who have 'merchandise' in their visibleSections array
    const result = await User.updateMany(
      { visibleSections: 'merchandise' },
      { $pull: { visibleSections: 'merchandise' } }
    );

    console.log(`Successfully updated ${result.modifiedCount} users`);
    console.log('Removed "merchandise" from all visibleSections arrays');

    // Verify the update
    const remainingUsers = await User.countDocuments({
      visibleSections: 'merchandise'
    });
    console.log(`Users still with 'merchandise': ${remainingUsers}`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeMerchandiseSection();
