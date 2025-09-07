import connectDB from '@/db/ConnectDb.js';
import { processExpiredPoints, sendExpiryWarnings } from '@/utils/pointsHelpers.js';

async function testExpirySystem() {
  try {
    await connectDB();
    console.log('🔌 Connected to database');

    console.log('\n🧪 Testing expiry system...');

    // Test processing expired points
    console.log('\n1️⃣ Testing expired points processing...');
    const expiredResult = await processExpiredPoints();
    console.log('Expired points result:', expiredResult);

    // Test sending expiry warnings
    console.log('\n2️⃣ Testing expiry warnings...');
    const warningResult = await sendExpiryWarnings(7); // 7 days warning
    console.log('Warning result:', warningResult);

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testExpirySystem();
}

export { testExpirySystem };
