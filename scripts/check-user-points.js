/**
 * Quick script to check user points
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://arpit:arpit4321@cluster0.k6wik.mongodb.net/instafam');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const checkUserPoints = async () => {
  await connectDB();
  
  try {
    const userModel = mongoose.model('User', new mongoose.Schema({
      username: String,
      points: Number,
    }));
    
    const user = await userModel.findOne(
      { username: '_instafam_official' },
      { username: 1, points: 1 }
    );
    
    if (user) {
      console.log(`🎯 User: ${user.username}`);
      console.log(`💎 Current FamPoints: ${user.points}`);
      console.log(`\n✅ Expected: 110 FamPoints (10 original + 100 refund)`);
      
      if (user.points === 110) {
        console.log(`🎉 SUCCESS! Points are correctly incremented!`);
      } else if (user.points === 10) {
        console.log(`❌ ISSUE: Still showing original points (refund didn't increment)`);
      } else if (user.points === 100) {
        console.log(`❌ ISSUE: Points were replaced with refund amount (not incremented)`);
      } else {
        console.log(`🤔 UNEXPECTED: Points value ${user.points} doesn't match expected scenarios`);
      }
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking user points:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

checkUserPoints();
