import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import { processExpiredPoints } from '@/utils/pointsHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Verify cron secret to prevent unauthorized access
const verifyCronSecret = (request) => {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If no secret is set, allow in development
    if (!cronSecret && process.env.NODE_ENV === 'development') {
        return true;
    }

    return authHeader === `Bearer ${cronSecret}`;
};

export async function GET(request) {
    try {
        // Verify this is a legitimate cron request
        if (!verifyCronSecret(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        console.log('Running points expiry via API...');
        const result = await processExpiredPoints();

        return NextResponse.json({
            success: true,
            message: 'Points expiry processed',
            result
        });

    } catch (error) {
        console.error('Error processing expired points:', error);
        return NextResponse.json(
            { error: 'Failed to process expired points', details: error.message },
            { status: 500 }
        );
    }
}
