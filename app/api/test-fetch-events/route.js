import { NextResponse } from 'next/server';
import { fetchEvents } from '@/actions/useractions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Testing fetchEvents function...');
    
    // Test with the known test user ID
    const testUserId = '67a39f400ddad5d40eacc616';
    console.log('Testing with userId:', testUserId);
    
    const result = await fetchEvents(testUserId, 'history');
    console.log('fetchEvents result:', result);
    
    return NextResponse.json({
      success: true,
      result: result,
      type: typeof result,
      isArray: Array.isArray(result),
      hasEvents: result?.events ? result.events.length : 'no events property',
      totalEarnings: result?.totalEarnings || 'no totalEarnings property',
      totalPayments: result?.totalPayments || 'no totalPayments property'
    });
  } catch (error) {
    console.error('Error testing fetchEvents:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
