import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Define User schema inline to avoid import issues
const userSchema = new mongoose.Schema({
  visibleSections: [String]
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function setDefaultSections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find users with no visibleSections or empty array
    const usersWithoutSections = await User.countDocuments({
      $or: [
        { visibleSections: { $exists: false } },
        { visibleSections: null },
        { visibleSections: [] }
      ]
    });
    console.log(`Found ${usersWithoutSections} users without visibleSections`);

    // Set default sections for users without any
    const result = await User.updateMany(
      {
        $or: [
          { visibleSections: { $exists: false } },
          { visibleSections: null },
          { visibleSections: [] }
        ]
      },
      { $set: { visibleSections: ['contribute', 'vault', 'links'] } }
    );

    console.log(`Successfully updated ${result.modifiedCount} users with default sections`);

    // Verify the update
    const remainingUsers = await User.countDocuments({
      $or: [
        { visibleSections: { $exists: false } },
        { visibleSections: null },
        { visibleSections: [] }
      ]
    });
    console.log(`Users still without sections: ${remainingUsers}`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setDefaultSections();
