/**
 * Check user points in database directly
 */

const checkUserPoints = async () => {
  try {
    console.log('🔄 Checking user points in database...');
    
    const response = await fetch('http://localhost:3000/api/points', {
      method: 'GET',
      headers: {
        'Cookie': 'next-auth.session-token=your-session-token' // This won't work without proper auth
      }
    });

    const result = await response.text();
    console.log('Response:', result);

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
};

// Simple fetch without auth to test endpoint
const testEndpoint = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/admin/process-expired-redemptions', {
      method: 'POST'
    });
    
    const result = await response.json();
    console.log('✅ Endpoint test result:', result);
    
    // If no redemptions found, the previous ones were already processed
    if (result.totalProcessed === 0) {
      console.log('ℹ️  All expired redemptions have been processed. The points should be updated.');
      console.log('ℹ️  Try refreshing your browser or check if there are any caching issues.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testEndpoint();
