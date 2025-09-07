// This file should be imported and called when the application starts
import { startCronJobs } from '@/utils/cronJobs';

// Initialize cron jobs when this module is loaded
if (typeof window === 'undefined') { // Only run on server side
  try {
    startCronJobs();
    console.log('FamPoints expiry system initialized');
  } catch (error) {
    console.error('Failed to initialize FamPoints expiry system:', error);
  }
}

export { startCronJobs };
