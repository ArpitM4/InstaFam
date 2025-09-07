import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import { processExpiredPoints, sendExpiryWarnings } from '@/utils/pointsHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    
    // Check for API key for security (you can add this later)
    const authHeader = req.headers.get('authorization');
    const apiKey = process.env.CRON_API_KEY;
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'expire') {
      const result = await processExpiredPoints();
      return NextResponse.json({
        success: true,
        message: 'Expired points processed successfully',
        result
      });
    } else if (action === 'warn') {
      const daysAhead = 7; // Send warnings 7 days before expiry
      const result = await sendExpiryWarnings(daysAhead);
      return NextResponse.json({
        success: true,
        message: 'Expiry warnings sent successfully',
        result
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Points expiry process error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// For manual testing
export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'expire';

    if (action === 'expire') {
      const result = await processExpiredPoints();
      return NextResponse.json({
        success: true,
        message: 'Expired points processed successfully (TEST)',
        result
      });
    } else if (action === 'warn') {
      const result = await sendExpiryWarnings(7);
      return NextResponse.json({
        success: true,
        message: 'Expiry warnings sent successfully (TEST)',
        result
      });
    }

  } catch (error) {
    console.error('Points expiry process error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
