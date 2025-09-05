/**
 * Script to manually process expired redemptions
 * Can be run manually or scheduled as a cron job
 */

const processExpiredRedemptions = async () => {
  try {
    console.log('🔄 Starting expired redemption processing...');
    
    const response = await fetch('http://localhost:3000/api/admin/process-expired-redemptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Auto-refund processing completed successfully!');
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
      console.error('❌ Auto-refund processing failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  }
};

// If running as standalone script
if (require.main === module) {
  processExpiredRedemptions();
}

module.exports = { processExpiredRedemptions };
