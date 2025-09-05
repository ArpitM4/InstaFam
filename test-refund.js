/**
 * Simple test to check redemption status and manually create test data
 */

const testCreateOldRedemption = async () => {
  try {
    console.log('🔄 Creating a test redemption that is 31 days old...');
    
    const response = await fetch('http://localhost:3000/api/admin/process-expired-redemptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Test script results:');
      console.log(`📊 Results:`);
      console.log(`   - Total processed: ${result.totalProcessed}`);
      console.log(`   - Errors: ${result.totalErrors}`);
      console.log(`   - Message: ${result.message}`);
      
      if (result.results && result.results.length > 0) {
        console.log('\n📋 Detailed results:');
        result.results.forEach(item => {
          if (item.status === 'success') {
            console.log(`   ✅ ${item.fanUsername}: ${item.pointsRefunded} points refunded for "${item.vaultItemTitle}"`);
          } else {
            console.log(`   ❌ Error processing ${item.redemptionId}: ${item.error}`);
          }
        });
      }
    } else {
      console.error('❌ Test failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
};

// If running as standalone script
if (require.main === module) {
  testCreateOldRedemption();
}

module.exports = { testCreateOldRedemption };
