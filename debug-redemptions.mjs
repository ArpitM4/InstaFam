import connectDB from './db/ConnectDb.js';
import Redemption from './models/Redemption.js';

(async () => {
  try {
    await connectDB();
    console.log('Connected to database');
    
    const allRedemptions = await Redemption.find({}).populate('fanId', 'username points').populate('vaultItemId', 'title');
    console.log(`Found ${allRedemptions.length} total redemptions:`);
    
    allRedemptions.forEach(r => {
      const age = Math.floor((new Date() - new Date(r.redeemedAt)) / (1000 * 60 * 60 * 24));
      console.log(`- ${r._id}: ${r.status}, ${age} days old, ${r.pointsSpent} points, fan: ${r.fanId?.username}, current fan points: ${r.fanId?.points}`);
    });
    
    // Check for pending redemptions older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const expiredPending = await Redemption.find({
      status: 'Pending',
      redeemedAt: { $lt: thirtyDaysAgo }
    }).populate('fanId', 'username points').populate('vaultItemId', 'title');
    
    console.log(`\nFound ${expiredPending.length} pending redemptions older than 30 days:`);
    expiredPending.forEach(r => {
      const age = Math.floor((new Date() - new Date(r.redeemedAt)) / (1000 * 60 * 60 * 24));
      console.log(`- ${r._id}: ${r.status}, ${age} days old, ${r.pointsSpent} points, fan: ${r.fanId?.username}, current fan points: ${r.fanId?.points}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
