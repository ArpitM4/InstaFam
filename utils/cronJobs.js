import cron from 'node-cron';
import { processExpiredPoints, sendExpiryWarnings } from '@/utils/pointsHelpers';
import connectDB from '@/db/ConnectDb';

let cronJobsStarted = false;

export function startCronJobs() {
  if (cronJobsStarted) {
    console.log('Cron jobs already started');
    return;
  }

  console.log('Starting FamPoints expiry cron jobs...');

  // Daily expiry check at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily points expiry check...');
    try {
      await connectDB();
      const result = await processExpiredPoints();
      console.log('Points expiry processing completed:', result);
    } catch (error) {
      console.error('Error in daily expiry check:', error);
    }
  }, {
    timezone: "America/New_York" // Adjust to your timezone
  });

  // Weekly expiry warnings (every Sunday at 10 AM)
  cron.schedule('0 10 * * 0', async () => {
    console.log('Running weekly expiry warnings...');
    try {
      await connectDB();
      const result = await sendExpiryWarnings(7); // 7 days warning
      console.log('Expiry warnings sent:', result);
    } catch (error) {
      console.error('Error sending expiry warnings:', error);
    }
  }, {
    timezone: "America/New_York" // Adjust to your timezone
  });

  // Optional: Run every hour during development for testing
  if (process.env.NODE_ENV === 'development') {
    cron.schedule('0 * * * *', async () => {
      console.log('Development: Hourly expiry check...');
      try {
        await connectDB();
        // Only process points that expired more than 1 minute ago for testing
        const now = new Date();
        const testExpiry = new Date(now.getTime() - 60000); // 1 minute ago
        console.log('Test expiry check for points older than:', testExpiry);
      } catch (error) {
        console.error('Error in development expiry check:', error);
      }
    });
  }

  cronJobsStarted = true;
  console.log('FamPoints expiry cron jobs started successfully');
}

export function stopCronJobs() {
  cron.getTasks().forEach(task => task.destroy());
  cronJobsStarted = false;
  console.log('Cron jobs stopped');
}
